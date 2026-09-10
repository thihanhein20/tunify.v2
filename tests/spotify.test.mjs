import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import vm from 'node:vm';
import ts from 'typescript';

// Model native fetch/body reads rejecting when their signal is aborted.
function waitForAbort(signal) {
  return new Promise((_, reject) => {
    if (signal.aborted) reject(signal.reason);
    else signal.addEventListener('abort', () => reject(signal.reason), { once: true });
  });
}

function app(fetch, options = {}) {

  const storage = new Map();
  const window = new EventTarget();

  window.location = { origin: 'http://127.0.0.1:3000', search: '', pathname: '/', assign(url) { this.target = url; } };
  window.history = { replaceState() { window.location.search = ''; } };

  const cache = new Map();

  function load(path) {

    path = resolve(path);
    if (cache.has(path)) return cache.get(path);
    const exports = {};
    cache.set(path, exports);

    const code = ts.transpileModule(readFileSync(path, 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } }).outputText;

    vm.runInNewContext(code, { exports, require: name => load(resolve(dirname(path), name + '.ts')), process: {env: {NEXT_PUBLIC_SPOTIFY_CLIENT_ID: 'public-id', NEXT_PUBLIC_SPOTIFY_REDIRECT_URI: 'http://127.0.0.1:3000/'}}, window, sessionStorage: {getItem: key => storage.get(key) ?? null, setItem: (key,value) => storage.set(key,value), removeItem: key => storage.delete(key)}, fetch: async (...args) => {
      const response = await fetch(...args);
      return { json: async () => null, headers: new Headers(), ...response };
    }, URL, AbortController, TypeError, setTimeout: options.setTimeout ?? setTimeout, clearTimeout: options.clearTimeout ?? clearTimeout, crypto: globalThis.crypto, TextEncoder, Uint8Array, btoa, URLSearchParams, Event, Date: options.Date ?? Date
    });

    return exports;
  }
  return {
    auth: load('src/lib/spotify/auth/session.ts'), search: load('src/lib/spotify/api/search.ts').searchSpotify, storage, window
  };
}

const tokens = {access_token:'access', refresh_token:'refresh', expires_in:3600};
const saved = (expiresAt = Date.now()+3600000) => JSON.stringify({accessToken:'old',refreshToken:'refresh',expiresAt});

test('PKCE challenge matches the RFC 7636 vector', async () => {
  const {auth} = app();
  assert.equal(await auth.createChallenge('dBjftJeZ4CVP-mB92K27uhbUJU1p1r_wW1gFWFOEjXk'), 'E9Melhoa2OwvFrEMTJguCHaoeK1t8URWbuGJSstw-cM');
});

test('login uses S256 and no client secret or personal-data scopes', async () => {

  const {auth,window} = app(); await auth.login();
  const url = new URL(window.location.target);

  assert.equal(url.searchParams.get('code_challenge_method'),'S256');
  assert.equal(url.searchParams.get('redirect_uri'),'http://127.0.0.1:3000/');
  assert.equal(url.searchParams.has('client_secret'),false);
  assert.equal(url.searchParams.has('scope'), false);

});

test('invalid callback state is rejected before a token request', async () => {

  let calls=0; const {auth,storage,window}=app(async()=>{calls++;});
  storage.set('tunify.pkce',JSON.stringify({state:'expected',verifier:'v',createdAt:Date.now()}));
  window.location.search='?code=c&state=wrong';
  await assert.rejects(auth.completeLogin(),/invalid or expired/); assert.equal(calls,0);
  assert.equal(window.location.search, '');

});

test('callback is single-flight and exchanges the verifier, never a secret', async () => {

  let calls=0; const {auth,storage,window}=app(async (url,options)=>{
    calls++; assert.equal(options.body.get('code_verifier'),'verifier'); assert.equal(options.body.has('client_secret'),false);
    return {ok:true,json:async()=>tokens};
  });

  storage.set('tunify.pkce',JSON.stringify({state:'state',verifier:'verifier',createdAt:Date.now()}));
  window.location.search = '?code=c&state=state';

  await Promise.all([auth.completeLogin(), auth.completeLogin()]); assert.equal(calls, 1);

  assert.equal(auth.readSession().accessToken, 'access');

});

test('expired token refresh is shared and persists rotated tokens', async () => {

  let calls=0; const {auth,storage}=app(async()=>{calls++;return {ok:true,json:async()=>({...tokens,refresh_token:'rotated'})};});
  storage.set('tunify.session',saved(0));
  await Promise.all([auth.getAccessToken(),auth.getAccessToken()]);
  assert.equal(calls, 1); assert.equal(auth.readSession().refreshToken, 'rotated');

});

test('logout during a refresh cannot restore the session', async () => {

  let finish; const {auth,storage}=app(()=>new Promise(resolve=>{finish=resolve;}));
  storage.set('tunify.session',saved(0)); const pending=auth.getAccessToken(); auth.logout();
  finish({ ok: true, json: async () => tokens }); await assert.rejects(pending); assert.equal(auth.readSession(), null);

});

test('search encodes input and retries a 401 once with a refreshed token', async () => {
  let searches = 0; const { search, storage } = app(async (url) => {

    if(url.includes('/api/token')) return {ok:true,json:async()=>tokens};
    assert.equal(new URL(url).searchParams.get('q'),'AC/DC & friends');
    searches++; return searches===1 ? {status:401} : {ok:true,json:async()=>({tracks:{items:[]}})};
  });

  storage.set('tunify.session',saved()); await search('AC/DC & friends'); assert.equal(searches,2);
});

test('rate limits block subsequent requests until Retry-After', async () => {

  let calls = 0; const { search, storage } = app(async () => { calls++; return { status: 429, headers: new Headers({ 'Retry-After': '60' }) }; });

  storage.set('tunify.session',saved()); await assert.rejects(search('one'),/60 seconds/); await assert.rejects(search('two'),/seconds/); assert.equal(calls,1);
});

test('blank and cancelled searches do not call Spotify', async () => {

  let calls=0; const {search,storage}=app(async()=>{calls++;}); storage.set('tunify.session',saved());
  await search('  '); const controller = new AbortController(); controller.abort();

  await assert.rejects(search('song', controller.signal)); assert.equal(calls, 0);

});

test('temporary refresh failures preserve the session and allow retry', async () => {
  for (const failure of ['network', 503]) {

    let calls = 0;

    const {auth,storage} = app(async () => {
      calls++;
      if (calls > 1) return {ok:true,json:async()=>tokens};
      if (failure === 'network') throw new Error('Network offline');
      return {ok:false,status:failure,json:async()=>({error:'temporarily_unavailable'})};
    });

    storage.set('tunify.session', saved(0));

    await assert.rejects(auth.getAccessToken());

    assert.equal(auth.readSession().refreshToken,'refresh');
    assert.equal(await auth.getAccessToken(), 'access');

  }

});

test('rejected refresh credentials clear the session and announce expiry', async () => {
  const {auth,storage,window}=app(async()=>({ok:false,status:400,json:async()=>({error:'invalid_grant'})}));
  let expired = false;

  window.addEventListener('tunify-session-expired',()=>{expired=true;});
  storage.set('tunify.session',saved(0));
  await assert.rejects(auth.getAccessToken(), /session expired/);

  assert.equal(auth.readSession(),null);
  assert.equal(expired, true);

});

test('search network failures show a useful message without logging out', async () => {
  const {auth,storage,search}=app(async()=>{throw new TypeError('Failed to fetch');});
  storage.set('tunify.session',saved());
  await assert.rejects(search('song'),/Check your internet connection/);
  assert.notEqual(auth.readSession(),null);
});

test('login rejects a different origin before storing PKCE data', async () => {
  const {auth,storage,window}=app();
  for (const origin of ['http://localhost:3000', 'https://preview.example.com']) {
    window.location.origin=origin;
    await assert.rejects(auth.login(),/Open http:\/\/127.0.0.1:3000\//);
    assert.equal(storage.has('tunify.pkce'),false);
    assert.equal(window.location.target,undefined);
  }
});

test('token cooldown honours seconds, HTTP dates, and missing Retry-After', async () => {
  for (const header of ['60', 'Thu, 01 Jan 1970 00:02:00 GMT', null]) {
    let now=60_000, calls=0;
    class Clock extends Date { static now() { return now; } }
    const {auth,storage}=app(async()=>{
      calls++;
      return calls===1
        ? {ok:false,status:429,headers:new Headers(header===null ? {} : {'Retry-After':header}),json:async()=>({error:'rate_limit'})}
        : {ok:true,json:async()=>tokens};
    }, { Date: Clock });

    storage.set('tunify.session', saved(0));

    await assert.rejects(auth.getAccessToken(),/seconds/);
    await assert.rejects(auth.getAccessToken(),/seconds/);
    assert.equal(calls, 1);

    assert.equal(auth.readSession().refreshToken,'refresh');
    now += header === null ? 30_000 : 60_000;

    assert.equal(await auth.getAccessToken(),'access');
    assert.equal(calls, 2);

  }
});

test('invalid token payloads never overwrite the saved session', async () => {
  for (const payload of [null, {...tokens,access_token:42}, {...tokens,access_token:' '}, {...tokens,expires_in:0}, {...tokens,expires_in:-1}, {...tokens,expires_in:Infinity}, {...tokens,refresh_token:42}]) {
    const {auth,storage}=app(async()=>({ok:true,json:async()=>payload}));
    const original=saved(0); storage.set('tunify.session',original);
    await assert.rejects(auth.getAccessToken(),/invalid token response/);
    assert.equal(storage.get('tunify.session'),original);
  }
});

test('token timeout covers stalled headers and bodies, preserves session, and permits retry', async () => {
  for (const stage of ['headers', 'body']) {

    let timeout, calls=0, requestSignal;
    const {auth,storage}=app(async(url,options)=>{
      calls++; requestSignal=options.signal;
      if(calls>1) return {ok:true,json:async()=>tokens};
      if(stage==='headers') return waitForAbort(options.signal);
      return { ok: true, json: () => waitForAbort(options.signal) };

    }, { setTimeout: callback => { timeout = callback; return 1; }, clearTimeout: () => { } });

    storage.set('tunify.session',saved(0));
    const pending=auth.getAccessToken();
    await Promise.resolve(); await Promise.resolve();

    timeout();

    await assert.rejects(pending,/too long/);
    assert.equal(requestSignal.aborted,true);
    assert.equal(auth.readSession().refreshToken,'refresh');
    assert.equal(await auth.getAccessToken(),'access');
  }
});

test('search timeout is recoverable and aborts the underlying request', async () => {
  let timeout, signal;
  const {search,storage,auth}=app(async(url,options)=>{signal=options.signal;return waitForAbort(signal);},
    {setTimeout:callback=>{timeout=callback;return 1;},clearTimeout:()=>{}});
  storage.set('tunify.session',saved());
  const pending=search('song'); await new Promise(resolve => setImmediate(resolve)); timeout();
  await assert.rejects(pending,/too long/); assert.equal(signal.aborted,true); assert.notEqual(auth.readSession(),null);
});

test('bfcache restore resets connecting, resynchronises session, and cleans up its listener', async () => {
  const window=new EventTarget();
  const values=[false,false,false,''];
  let stateIndex=0, effect, connected=false;
  const react={
    createContext:()=>({Provider:'provider'}),
    useContext:()=>{},
    useEffect:callback=>{effect=callback;},
    useState:()=>{const index=stateIndex++;return [values[index],value=>{values[index]=value;}];},
  };
  const exports={};
  const code=ts.transpileModule(readFileSync('src/components/auth/SpotifySession.tsx','utf8'),{
    compilerOptions:{module:ts.ModuleKind.CommonJS,jsx:ts.JsxEmit.ReactJSX,target:ts.ScriptTarget.ES2022},
  }).outputText;
  vm.runInNewContext(code,{exports,window,require:name=>{
    if(name==='react') return react;
    if(name==='react/jsx-runtime') return {jsx:(type,props)=>({type,props})};
    return {completeLogin:async()=>false,login:async()=>{},logout:()=>{},readSession:()=>connected ? {accessToken:'token'} : null};
  }});
  const tree=exports.SpotifySession({children:null});
  const cleanup=effect();
  await tree.props.value.connect();
  assert.equal(values[2],true);
  connected=true;
  const restored=new Event('pageshow'); Object.defineProperty(restored,'persisted',{value:true});
  window.dispatchEvent(restored);
  assert.equal(values[2],false); assert.equal(values[0],true); assert.equal(values[1],true);
  cleanup(); values[2]=true; connected=false;
  window.dispatchEvent(restored);
  assert.equal(values[2],true); assert.equal(values[0],true);
});
