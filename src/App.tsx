import { Routes, Route } from "react-router-dom";
import Layout from "./components/Layout";
import { CartProvider } from "./context/CartContext";
import { WishlistProvider } from "./context/WishlistContext";
import { OrderProvider } from "./context/OrderContext";

// Admin (kept outside the storefront Layout — own sidebar/header/footer).
import RequireAdmin from "./admin/RequireAdmin";
import AdminLoginPage from "./admin/AdminLoginPage";
import AdminNotFoundPage from "./admin/pages/AdminNotFoundPage";
import DashboardPage from "./admin/pages/DashboardPage";
import ProductsPage from "./admin/pages/ProductsPage";
import OrdersPage from "./admin/pages/OrdersPage";
import UsersPage from "./admin/pages/UsersPage";
import SalesPage from "./admin/pages/SalesPage";
import RevenuePage from "./admin/pages/RevenuePage";
import AddressesPage from "./admin/pages/AddressesPage";

// Storefront pages.
import Home from "./pages/Home";
import Catalogue from "./pages/Catalogue";
import ProductDetails from "./pages/ProductDetails";
import Cart from "./pages/Cart";
import Checkout from "./pages/Checkout";
import OrderSuccess from "./pages/OrderSuccess";
import Wishlist from "./pages/Wishlist";
import Contact from "./pages/Contact";
import About from "./pages/About";
import FAQ from "./pages/FAQ";
import Shipping from "./pages/Shipping";
import Returns from "./pages/Returns";
import Privacy from "./pages/Privacy";
import Terms from "./pages/Terms";
import NotFound from "./pages/NotFound";

export default function App() {
  return (
    <CartProvider>
      <WishlistProvider>
        <OrderProvider>
          <Routes>
            {/* ---------------- Admin ---------------- */}
            <Route path="/admin/login" element={<AdminLoginPage />} />
            <Route path="/admin" element={<RequireAdmin />}>
              <Route index element={<DashboardPage />} />
              <Route path="products" element={<ProductsPage />} />
              <Route path="orders" element={<OrdersPage />} />
              <Route path="users" element={<UsersPage />} />
              <Route path="sales" element={<SalesPage />} />
              <Route path="revenue" element={<RevenuePage />} />
              <Route path="addresses" element={<AddressesPage />} />
              <Route path="*" element={<AdminNotFoundPage />} />
            </Route>

            {/* ---------------- Storefront ---------------- */}
            <Route path="/" element={<Layout />}>
              <Route index element={<Home />} />
              <Route path="catalogue" element={<Catalogue />} />
              <Route path="product/:slug" element={<ProductDetails />} />
              <Route path="cart" element={<Cart />} />
              <Route path="checkout" element={<Checkout />} />
              <Route path="order-success" element={<OrderSuccess />} />
              <Route path="wishlist" element={<Wishlist />} />
              <Route path="contact" element={<Contact />} />
              <Route path="about" element={<About />} />
              <Route path="faq" element={<FAQ />} />
              <Route path="shipping" element={<Shipping />} />
              <Route path="returns" element={<Returns />} />
              <Route path="privacy" element={<Privacy />} />
              <Route path="terms" element={<Terms />} />
              <Route path="*" element={<NotFound />} />
            </Route>
          </Routes>
        </OrderProvider>
      </WishlistProvider>
    </CartProvider>
  );
}
