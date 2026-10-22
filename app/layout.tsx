import type { Metadata, Viewport } from "next";
import { Plus_Jakarta_Sans, Playfair_Display } from "next/font/google";
import "./globals.css";

const sans = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-sans-body",
  display: "swap",
});

const serif = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-serif-display",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Meeva Greens | Botanical Cafe & Specialty Coffee",
  description:
    "An artisanal botanical cafe and specialty coffee house in Pimpri-Chinchwad, Pune. Nourish. Brew. Gather.",
  applicationName: "Meeva Greens",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Meeva Greens",
  },
  manifest: "/manifest.json",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  viewportFit: "cover",
  themeColor: "#1B382B",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${sans.variable} ${serif.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-[#FBF9F4] text-[#151E19]">
        {children}
      </body>
    </html>
  );
}
