import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
const root = path.resolve('out');
const types = {'.html':'text/html','.js':'text/javascript','.css':'text/css','.json':'application/json','.png':'image/png','.svg':'image/svg+xml','.ico':'image/x-icon','.woff2':'font/woff2'};
http.createServer((req,res) => {
  let filename;
  try { filename=path.resolve(root,'.'+decodeURIComponent(new URL(req.url,'http://127.0.0.1').pathname)); }
  catch {res.writeHead(400).end();return;}
  if(filename!==root && !filename.startsWith(root+path.sep)){res.writeHead(403).end();return;}
  if(!fs.existsSync(filename) && fs.existsSync(filename+'.html')) filename += '.html';
  if(fs.existsSync(filename) && fs.statSync(filename).isDirectory()) filename=path.join(filename,'index.html');
  fs.readFile(filename,(error,data)=>{
    if(error){res.writeHead(404).end('Not found');return;}
    res.setHeader('Content-Type',types[path.extname(filename)]||'application/octet-stream');res.end(data);
  });
}).listen(3000,'127.0.0.1',()=>console.log('Static preview: http://127.0.0.1:3000'));
