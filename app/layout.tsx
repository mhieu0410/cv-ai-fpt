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
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"),
  title: {
    default: "CV AI — Tạo CV & Match JD cho sinh viên FPT",
    template: "%s · CV AI",
  },
  description:
    "Công cụ AI giúp sinh viên FPT viết CV theo ngữ cảnh, đối chiếu với JD và tối ưu vượt bộ lọc ATS để sẵn sàng cho OJT/internship.",
  keywords: ["CV", "FPT", "OJT", "internship", "ATS", "JD matching", "sinh viên FPT"],
  openGraph: {
    title: "CV AI — Tạo CV & Match JD cho sinh viên FPT",
    description:
      "Viết CV theo ngữ cảnh FPT, đối chiếu với JD cụ thể, tối ưu vượt bộ lọc nhà tuyển dụng.",
    type: "website",
    locale: "vi_VN",
  },
  robots: { index: true, follow: true },
};

import { LenisProvider } from "@/components/lenis-provider";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="vi"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <LenisProvider>{children}</LenisProvider>
      </body>
    </html>
  );
}
