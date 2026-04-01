import React from "react";
import { useSearchParams } from "react-router-dom";
import Navbar from "../components/Navbar";
import TicketCard from "../components/TicketCard";

const TicketPage = () => {
  const [searchParams] = useSearchParams();

  // ✅ Read QR and booking data from URL
  const qrCode = searchParams.get("qr");
  const bookingId = searchParams.get("booking_id") || "MUSEO-" + Math.random().toString(36).substr(2, 6).toUpperCase();

  // ✅ Read real booking data from localStorage
  // (we'll save it during payment — see below)
  const bookingData = JSON.parse(localStorage.getItem("last_booking") || "{}");

  const ticket = {
    exhibition: bookingData.show_name || "Museum Visit",
    gallery: bookingData.museum_name || "Main Gallery",
    tickets: bookingData.tickets?.adult || 1,
    date: bookingData.visit_date || "—",
    time: bookingData.time_slot || "—",
    ticketId: bookingId,
    qrCode: bookingData.qr_code  // ✅ real QR from backend
  };

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-white dark:bg-neutral-900 flex items-center justify-center px-6">
        <TicketCard ticket={ticket} />
      </div>
    </>
  );
};

export default TicketPage;