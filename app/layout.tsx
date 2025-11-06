import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Food For Zot",
  description: "Your grocery buddy.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
      >
        {children}
      </body>
    </html>
  );
}
