import { useState } from "react";
import { Outlet } from "react-router-dom";
import Header from "./Header";
import Footer from "./Footer";
import WhatsAppButton from "./WhatsAppButton";
import CartToast from "./CartToast";
import ScrollToTop from "./ScrollToTop";

export default function Layout() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className="flex min-h-screen flex-col bg-[var(--color-cream)]">
      <ScrollToTop />
      <Header menuOpen={menuOpen} setMenuOpen={setMenuOpen} />
      <CartToast />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
      <WhatsAppButton hidden={menuOpen} />
    </div>
  );
}
