import type { Metadata, Viewport } from "next";
import { Public_Sans, Playfair_Display, Cormorant_Garamond, IBM_Plex_Mono } from "next/font/google";
import "./globals.css";
import { ServiceWorkerRegister } from "@/components/ServiceWorkerRegister";
import { PreferencesProvider } from "@/components/PreferencesProvider";

const publicSans = Public_Sans({
  variable: "--font-public-sans",
  weight: ["400", "500", "600", "700", "800"],
  subsets: ["latin"],
  display: "swap",
});

const playfair = Playfair_Display({
  variable: "--font-playfair",
  weight: ["500", "600", "700"],
  style: ["normal", "italic"],
  subsets: ["latin"],
  display: "swap",
});

const cormorant = Cormorant_Garamond({
  variable: "--font-cormorant",
  weight: ["300", "400", "500", "600"],
  style: ["normal", "italic"],
  subsets: ["latin"],
  display: "swap",
});

const plexMono = IBM_Plex_Mono({
  variable: "--font-plex-mono",
  weight: ["400", "500"],
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Sensory — The map for how a place feels",
  description:
    "Accessibility map for autistic, sensory-sensitive, wheelchair, deaf, blind, and ESL communities.",
  applicationName: "Sensory",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Sensory",
  },
  formatDetection: { telephone: false },
};

export const viewport: Viewport = {
  themeColor: "#eaffe9",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${publicSans.variable} ${playfair.variable} ${cormorant.variable} ${plexMono.variable} h-full antialiased`}>
      <head>
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200&display=swap"
        />
      </head>
      <body className="min-h-screen flex flex-col bg-background text-on-background">
        <PreferencesProvider />
        {children}
        <ServiceWorkerRegister />
      </body>
    </html>
  );
}
