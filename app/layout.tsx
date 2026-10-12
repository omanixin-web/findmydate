import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://findmydate.in"),
  title: { default: "FindMyDate | We find your person, and plan the date", template: "%s | FindMyDate" },
  description: "Tell us who you are in a few thoughtful steps. FindMyDate finds a compatible match and arranges the first date for you.",
};
export const viewport: Viewport = { themeColor: "#2a0f24" };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Bodoni+Moda:ital,opsz,wght@0,6..96,500;1,6..96,500&family=Figtree:wght@400;500;600&display=swap" rel="stylesheet" />
      </head>
      <body>{children}</body>
    </html>
  );
}
