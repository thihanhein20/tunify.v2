import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Tunify | Music search",
  description: "A small client-side Spotify music search project.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body>{children}</body></html>;
}
