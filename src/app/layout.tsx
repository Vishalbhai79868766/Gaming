import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "NEXZZA | Gaming Community Platform",
  description: "Next-gen community hub for competitive gamers and creators.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" data-theme="dark" className="dark">
      <body className="bg-navy-900 text-slate-100 antialiased min-h-screen">
        {children}
      </body>
    </html>
  );
}