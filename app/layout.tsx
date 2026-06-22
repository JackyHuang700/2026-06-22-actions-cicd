import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ReactQueryProvider } from '@/components/react-query/react-query-provider'

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Gridnix — 全球分布式 Edge VPS 平台",
  description: "全球邊緣基礎設施平台，助您建構更快、更安全、更可靠的應用體驗。",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-TW" className={`${inter.variable} antialiased`}>
      <ReactQueryProvider>{children}</ReactQueryProvider>
    </html>
  );
}
