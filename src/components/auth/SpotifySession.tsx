"use client";

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { completeLogin, login, logout, readSession } from "@/lib/spotify/auth/session";

const SessionContext = createContext({ connected: false, ready: false, connecting: false, error: "", connect: () => {}, disconnect: () => {} });

export function SpotifySession({ children }: { children: ReactNode }) {
  const [connected, setConnected] = useState(false);
  const [ready, setReady] = useState(false);
  const [connecting, setConnecting] = useState(false);
  const [error, setError] = useState("");
  useEffect(() => {
    let active = true;
    const sync = () => { if (active) setConnected(Boolean(readSession())); };
    const expired = () => { if (active) setError("Your Spotify session expired. Connect again to continue."); };
    const restore = (event: PageTransitionEvent) => {
      if (!event.persisted || !active) return;
      setConnecting(false);
      setReady(true);
      try { sync(); }
      catch { setError("Unable to restore your session. Please connect again."); }
    };
    window.addEventListener("pageshow", restore);
    window.addEventListener("tunify-session", sync);
    window.addEventListener("tunify-session-expired", expired);
    completeLogin().then(() => { if (active) sync(); }).catch(error => {
      if (active) setError(error instanceof Error ? error.message : "Unable to restore your session.");
    }).finally(() => { if (active) setReady(true); });
    return () => { active = false; window.removeEventListener("pageshow", restore); window.removeEventListener("tunify-session", sync); window.removeEventListener("tunify-session-expired", expired); };
  }, []);
  async function connect() {
    setError(""); setConnecting(true);
    try { await login(); } catch (error) {
      setError(error instanceof Error ? error.message : "Unable to connect Spotify.");
      setConnecting(false);
    }
  }
  return <SessionContext.Provider value={{ connected, ready, connecting, error, connect, disconnect: () => { setError(""); logout(); } }}>
    {children}
  </SessionContext.Provider>;
}

export function useSpotifySession() { return useContext(SessionContext); }

export function ConnectSpotify({ children = "Connect Spotify", className = "primary-button" }: { children?: ReactNode; className?: string }) {
  const { connect, connected, connecting, ready } = useSpotifySession();
  if (connected) return <a href="#search" className={className}>Search music ↗</a>;
  return <button type="button" onClick={connect} disabled={!ready || connecting} className={`${className} disabled:opacity-50`}>{connecting ? "Connecting…" : children}</button>;
}
