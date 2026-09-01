import { useState, type ReactNode } from "react";
import Header from "./Header";
import Footer from "./Footer";
import WhatsAppButton from "./WhatsAppButton";
import CartToast from "./CartToast";
import ScrollToTop from "./ScrollToTop";

export default function Layout({ children }: { children: ReactNode }) {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className="flex min-h-screen flex-col bg-[var(--color-cream)]">
      <ScrollToTop />
      <Header menuOpen={menuOpen} setMenuOpen={setMenuOpen} />
      <CartToast />
      <main className="flex-1">{children}</main>
      <Footer />
      <WhatsAppButton hidden={menuOpen} />
    </div>
  );
}
