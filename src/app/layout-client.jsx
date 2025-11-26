"use client";

import { usePathname } from "next/navigation";
import ImprovedNavbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { LanguageProvider } from "@/context/LanguageContext";

export default function LayoutClient({ children }) {
  const pathname = usePathname();

  const hideLayout = pathname === "/login" || pathname.startsWith("/admin");

  return (
    <>
      <LanguageProvider>
        {!hideLayout && <ImprovedNavbar />}
        {children}
        {!hideLayout && <Footer />}
      </LanguageProvider>
    </>
  );
}
