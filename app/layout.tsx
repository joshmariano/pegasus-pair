import type { Metadata } from "next";
import { Geist, Geist_Mono, Playfair_Display, Orbitron } from "next/font/google";
import "./globals.css";
import Navbar from "./components/Navbar";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const orbitron = Orbitron({
  variable: "--font-clock",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "Pegasus Pair – UCF Student Matching",
  description: "Student matching for UCF",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${playfair.variable} ${orbitron.variable} antialiased`}
        style={{
          backgroundColor: "#140b1a",
          color: "#f8fafc",
          fontFamily: "var(--font-geist-sans), ui-sans-serif, system-ui, sans-serif",
        }}
      >
        <Navbar />
        {children}
      </body>
    </html>
  );
}
