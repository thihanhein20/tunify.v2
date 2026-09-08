import type { Metadata } from "next";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { SpotifySession } from "@/components/auth/SpotifySession";
import "./globals.css";

export const metadata: Metadata = {
  title: "Tunify",
  description: "Discover your Spotify listening experience.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-paper text-ink">
        <SpotifySession>
        <Navbar />

        {children}

        <Footer />
        </SpotifySession>
      </body>
    </html>
  );
}
