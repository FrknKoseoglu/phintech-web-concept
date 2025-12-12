import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Midas Web Interface",
  description: "Desktop trading interface - A concept project",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className="bg-midas-black text-white antialiased">
        {children}
      </body>
    </html>
  );
}
