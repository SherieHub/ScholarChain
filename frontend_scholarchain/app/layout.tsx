import type { Metadata } from "next";
import Providers from "./providers";
import Header from "@/components/layout/Header";
import AnimatedBackground from "@/components/ui/AnimatedBackground";
import BlockchainSnake from "@/components/ui/BlockchainSnake";
import "./globals.css";

export const metadata: Metadata = {
  title: "ScholarChain",
  description: "Decentralized Scholarship Tracking System",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body suppressHydrationWarning>
        <AnimatedBackground />
        <BlockchainSnake />
        <Providers>
          <Header />
          <div className="flex flex-col flex-1 relative" style={{ zIndex: 1 }}>
            {children}
          </div>
        </Providers>
      </body>
    </html>
  );
}
