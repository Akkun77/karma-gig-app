import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";
import { Toaster } from "react-hot-toast";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = { manifest: "/manifest.json",
  title: "KarmaGig — Campus Gig Economy",
  description: "The campus gig economy, powered by Karma. Trade skills and favors with fellow students.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} h-full dark`}>
      <body className="min-h-full flex flex-col bg-background text-foreground">
        <AuthProvider>
          {children}
          <Toaster
            position="top-center"
            toastOptions={{
              style: {
                background: "#141420",
                color: "#f0f0f8",
                border: "1px solid rgba(245,158,11,0.3)",
                borderRadius: "12px",
              },
              success: { iconTheme: { primary: "#f59e0b", secondary: "#141420" } },
            }}
          />
        </AuthProvider>
      </body>
    </html>
  );
}

