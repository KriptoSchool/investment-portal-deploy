import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { UserProvider } from "@/contexts/UserContext";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Aaron M LLP - Investment Management Portal",
  description: "Professional investment management and dividend tracking system",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.className} antialiased`}>
        <UserProvider>
          {children}
        </UserProvider>
      </body>
    </html>
  );
}