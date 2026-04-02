import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ConvexClientProvider } from "./ConvexClientProvider";
import { ConvexAuthNextjsServerProvider } from "@convex-dev/auth/nextjs/server";
import { ThemeProvider } from "@/components/theme-provider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const APP_URL =
  process.env.NEXT_PUBLIC_APP_URL ?? "https://your-deploy-url.vercel.app";

export const metadata: Metadata = {
  metadataBase: new URL(APP_URL),
  title: {
    default: "Convex Next.js Chatbot Kit",
    template: "%s · Convex Chatbot Kit",
  },
  description:
    "Open-source production-ready AI chatbot starter built with Next.js App Router, Convex, Convex Auth, and persistent text streaming.",
  keywords: [
    "convex",
    "nextjs",
    "ai",
    "chatbot",
    "openai",
    "starter kit",
    "template",
    "open source",
    "streaming",
    "real-time",
  ],
  authors: [{ name: "the-niresh" }],
  creator: "the-niresh",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: APP_URL,
    title: "Convex Next.js Chatbot Kit",
    description:
      "Production-ready AI chatbot starter — Next.js 16, Convex, persistent streaming, email OTP auth.",
    siteName: "Convex Next.js Chatbot Kit",
  },
  twitter: {
    card: "summary_large_image",
    title: "Convex Next.js Chatbot Kit",
    description:
      "Production-ready AI chatbot starter — Next.js 16, Convex, persistent streaming, email OTP auth.",
    creator: "@the_niresh",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/icon.svg", type: "image/svg+xml" },
    ],
    apple: "/apple-touch-icon.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ConvexAuthNextjsServerProvider>
      <html lang="en" suppressHydrationWarning>
        <body
          className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground`}
        >
          <ThemeProvider
            attribute="class"
            defaultTheme="dark"
            enableSystem
            disableTransitionOnChange
          >
            <ConvexClientProvider>{children}</ConvexClientProvider>
          </ThemeProvider>
        </body>
      </html>
    </ConvexAuthNextjsServerProvider>
  );
}
