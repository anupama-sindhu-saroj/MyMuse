import { useEffect } from "react";
import { Routes, Route } from "react-router-dom";
import { useLocation } from "react-router-dom";
import AOS from "aos";
import "aos/dist/aos.css";

import Navbar from "./components/Navbar";
import Hero from "./components/Hero";
import InfoSection from "./components/InfoSection";
import Features from "./components/Features";
import Footer from "./components/Footer";

import PaymentPage from "./pages/PaymentPage";
import TicketPage from "./pages/TicketPage";
import Explore from "./pages/Explore";
import BookTicket from "./pages/BookTicket";

function App() {
  const location = useLocation();

  useEffect(() => {
    AOS.init({
      duration: 1000,
      once: true,
    });
  }, []);
  
  return (
    <div className="min-h-screen bg-white text-black dark:bg-black dark:text-white transition-colors duration-500">
      
      {location.pathname !== "/explore" && <Navbar />}

      <Routes>
        
        {/* Home Page */}
        <Route
          path="/"
          element={
            <>
              <Hero />
              <InfoSection />
              <Features />
              <Footer />
            </>
          }
        />

        {/* Payment Page */}
        <Route path="/payment" element={<PaymentPage />} />

        {/* Ticket Page */}
        <Route path="/ticket" element={<TicketPage />} />

        <Route path="/explore" element={<Explore />} />

        <Route path="/book" element={<BookTicket />} />
      </Routes>

    </div>
  );
}

export default App;