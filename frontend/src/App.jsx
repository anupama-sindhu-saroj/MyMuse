import { useEffect } from "react";
import { Routes, Route, useLocation } from "react-router-dom";
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
    <ThemeProvider>
    <div className="min-h-screen bg-white text-black dark:bg-black dark:text-white transition-colors duration-500">

    {location.pathname !== "/explore" && location.pathname !== "/book" && <Navbar />}

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
        {/* Dashboard */}
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/admin" element={<AdminGateway />} />

        {/* Explore Museums */}
        <Route path="/explore" element={<Explore />} />

        {/* Book Ticket */}
        <Route path="/book" element={<BookTicket />} />

        {/* Payment */}
        <Route path="/payment" element={<PaymentPage />} />

        {/* Ticket */}
        <Route path="/ticket" element={<TicketPage />} />

      </Routes>
      <Footer />

    </div>
    </ThemeProvider>
  );
}

export default App;