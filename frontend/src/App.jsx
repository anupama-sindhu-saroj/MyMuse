import { useEffect } from "react";
import { Routes, Route, useLocation, useNavigate } from "react-router-dom";
import AOS from "aos";
import "aos/dist/aos.css";

import { ThemeProvider } from "./context/ThemeContext";

import Navbar from "./components/Navbar";
import Hero from "./components/Hero";
import InfoSection from "./components/InfoSection";
import Features from "./components/Features";
import Footer from "./components/Footer";

import UserAuth from "./pages/user/UserAuth";
import UserForgotPassword from "./pages/user/UserForgotPassword";

import AdminGateway from "./pages/AdminGateway";
import Dashboard from "./pages/Dashboard";

import Explore from "./pages/Explore";
import BookTicket from "./pages/BookTicket";
import PaymentPage from "./pages/PaymentPage";
import TicketPage from "./pages/TicketPage";

import MuseumSignup from "./pages/MuseumSignup";
import MuseumLogin from "./pages/MuseumLogin";
import MuseumForgotPassword from "./pages/MuseumForgotPassword";

function App() {

  const location = useLocation();
  const navigate = useNavigate();

  // AOS animation
  useEffect(() => {
    AOS.init({
      duration: 1000,
      once: true,
    });
  }, []);

  useEffect(() => {
    AOS.refresh();
  }, [location]);

  // 🔐 Hidden Admin Shortcut
  useEffect(() => {

    const handleShortcut = (e) => {
      if (e.ctrlKey && e.shiftKey && e.key.toLowerCase() === "a") {
        e.preventDefault();
        navigate("/admin");
      }
    };

    window.addEventListener("keydown", handleShortcut);

    return () => {
      window.removeEventListener("keydown", handleShortcut);
    };

  }, [navigate]);

  // 🚫 Remove Google Translate Top Banner
  useEffect(() => {

    const removeBanner = () => {

      const banner = document.querySelector(".goog-te-banner-frame");

      if (banner) {
        banner.remove();
      }

      document.body.style.top = "0px";

    };

    const interval = setInterval(removeBanner, 500);

    return () => clearInterval(interval);

  }, []);

  return (
    <ThemeProvider>

      {/* Hidden Google Translate Element */}
      <div id="google_translate_element" style={{ display: "none" }}></div>

      <div className="min-h-screen bg-white text-black dark:bg-black dark:text-white transition-colors duration-500">

        {location.pathname !== "/explore" &&
         location.pathname !== "/book" && <Navbar />}

        <Routes>

          <Route
            path="/"
            element={
              <>
                <Hero />
                <InfoSection />
                <Features />
              </>
            }
          />

          <Route path="/userauth" element={<UserAuth />} />
          <Route path="/user-forgot-password" element={<UserForgotPassword />} />

          <Route path="/dashboard" element={<Dashboard />} />

          {/* Hidden Admin */}
          <Route path="/admin" element={<AdminGateway />} />

          {/* Explore */}
          <Route path="/explore" element={<Explore />} />

          {/* Booking */}
          <Route path="/book" element={<BookTicket />} />

          {/* Payment */}
          <Route path="/payment" element={<PaymentPage />} />

          {/* Ticket */}
          <Route path="/ticket" element={<TicketPage />} />

          {/* Museum Auth */}
          <Route path="/museum-signup" element={<MuseumSignup />} />
          <Route path="/museum-login" element={<MuseumLogin />} />
          <Route path="/museum-forgot-password" element={<MuseumForgotPassword />} />

        </Routes>

        {location.pathname !== "/museum-signup" &&
         location.pathname !== "/museum-login" &&
         location.pathname !== "/museum-forgot-password" && <Footer />}

      </div>

    </ThemeProvider>
  );
}

export default App;