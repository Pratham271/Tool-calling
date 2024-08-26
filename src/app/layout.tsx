import type { Metadata } from "next";
import { Inter as FontSans } from "next/font/google"
import { Toaster } from "sonner";
import "./globals.css";

import { cn } from "@/lib/utils"
 
const fontSans = FontSans({
  subsets: ["latin"],
  variable: "--font-sans",
})

export const metadata: Metadata = {
  title: "Perplex Jr.",
  description: "Perplex Jr. is a minimalistic AI-powered search engine that helps you find information on the internet.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={cn(
          "min-h-screen bg-background font-sans antialiased",
          fontSans.variable
        )}>
           <Toaster position="top-center" richColors />
          {children}
        </body>
    </html>
  );
}
