import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { MantineProvider } from '@mantine/core';
import '@mantine/core/styles.css';
import "./globals.css";  // Make sure this path is correct
import { NextAuthProvider } from "./dashboard/components/providers";

const inter = Inter({ subsets: ["latin"] });

const theme = {
  fontFamily: 'Poppins, sans-serif',
  primaryColor: 'cyan',
};

export const metadata: Metadata = {
  title: "SaaSy.lol",
  description: "No.1 Prospecting Tool!",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full">
      <body className={`${inter.className} h-full`}>
        <NextAuthProvider>
          <MantineProvider theme={theme}>
            {children}
          </MantineProvider>
        </NextAuthProvider>
      </body>
    </html>
  );
}