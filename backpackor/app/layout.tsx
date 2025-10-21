import Navbar from "@/components/navbar/Navbar";
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "백팩코",
  description: "대한민국 구석구석 여행 프로젝트",
  icons: {
    icon: "data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 64 64'><rect width='64' height='64' rx='12' fill='%23EAF0FF'/><path d='M20 16a12 12 0 0124 0v4h2a6 6 0 016 6v24a6 6 0 01-6 6H18a6 6 0 01-6-6V26a6 6 0 016-6h2v-4z' fill='%234155FF'/><rect x='22' y='32' width='20' height='10' rx='2' fill='white'/></svg>", // ✅ 이모티콘 favicon
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <Navbar />
        {children}
      </body>
    </html>
  );
}
