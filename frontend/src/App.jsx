import { useEffect } from "react";
import { Routes, Route, useLocation } from "react-router-dom";
import AOS from "aos";
import "aos/dist/aos.css";

import Navbar from "./components/Navbar";
import Hero from "./components/Hero";
import InfoSection from "./components/InfoSection";
import Features from "./components/Features";
import Footer from "./components/Footer";

import Dashboard from "./pages/Dashboard";
import Explore from "./pages/Explore";
import BookTicket from "./pages/BookTicket";
import PaymentPage from "./pages/PaymentPage";
import TicketPage from "./pages/TicketPage";

function App() {

  const location = useLocation();

  useEffect(() => {
    AOS.init({
      duration: 1000,
      once: true,
    });
  }, []);

  useEffect(() => {
    AOS.refresh();
  }, [location]);

  return (
    <div className="min-h-screen bg-white text-black dark:bg-black dark:text-white transition-colors duration-500">

      {/* Hide Navbar on Explore page */}
      {location.pathname !== "/explore" && <Navbar />}

      <Routes>

        {/* Landing Page */}
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

        {/* Dashboard */}
        <Route path="/dashboard" element={<Dashboard />} />

        {/* Explore Museums */}
        <Route path="/explore" element={<Explore />} />

        {/* Book Ticket */}
        <Route path="/book" element={<BookTicket />} />

        {/* Payment */}
        <Route path="/payment" element={<PaymentPage />} />

        {/* Ticket */}
        <Route path="/ticket" element={<TicketPage />} />

      </Routes>

      {/* Hide Footer on Explore */}
      {location.pathname !== "/explore" && <Footer />}

    </div>
  );
}

export default App;