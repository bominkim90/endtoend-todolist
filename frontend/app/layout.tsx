import type { Metadata } from "next";
import "./globals.css";
import StoreProvider from "./StoreProvider";

export const metadata: Metadata = {
  title: "TodoList",
  description: "TodoList 서비스",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body className="min-h-screen bg-[#F8F9FA] antialiased">
        <StoreProvider>{children}</StoreProvider>
      </body>
    </html>
  );
}
