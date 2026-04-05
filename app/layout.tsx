import type { Metadata, Viewport } from "next";
import {
  Cormorant_Garamond,
  Geist,
  Geist_Mono,
  Orbitron,
  Outfit,
  Playfair_Display,
} from "next/font/google";
import "./globals.css";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import { BackgroundGradientAnimation } from "./components/ui/background-gradient-animation";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

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

const cormorant = Cormorant_Garamond({
  variable: "--font-cormorant",
  subsets: ["latin"],
  weight: ["300", "400", "600", "700"],
  style: ["normal", "italic"],
});

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
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
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${playfair.variable} ${cormorant.variable} ${outfit.variable} ${orbitron.variable} antialiased`}
        style={{
          backgroundColor: "#140a18",
          color: "#f8fafc",
          fontFamily: "var(--font-geist-sans), ui-sans-serif, system-ui, sans-serif",
        }}
      >
        <BackgroundGradientAnimation
          className="min-h-screen flex flex-col"
          interactive={false}
          gradientBackgroundStart="rgb(20, 10, 24)"
          gradientBackgroundEnd="rgb(14, 8, 22)"
          firstColor="255, 126, 179"
          secondColor="219, 88, 170"
          thirdColor="168, 127, 255"
          fourthColor="255, 180, 209"
          fifthColor="192, 138, 255"
          size="112%"
          blendingValue="soft-light"
        >
          <Navbar />
          <main className="app-main" style={{ flex: 1 }}>{children}</main>
          <Footer />
        </BackgroundGradientAnimation>
      </body>
    </html>
  );
}
