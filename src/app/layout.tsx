import type { Metadata } from "next";
import "./style.css";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";

export const metadata: Metadata = {
  title: "AdFlow Pro — Premium Sponsored Listings Marketplace",
  description: "AdFlow Pro helps you reach your target audience through moderated, high-quality ad placements with flexible scheduling and instant analytics.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col text-slate-200" style={{ background: 'radial-gradient(circle at 30% -10%, #1e1b4b 0%, #0f172a 55%, #0a0a1a 100%)', backgroundAttachment: 'fixed' }}>
        <Navbar />
        <main className="flex-1 flex flex-col items-center w-full">
          {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}

