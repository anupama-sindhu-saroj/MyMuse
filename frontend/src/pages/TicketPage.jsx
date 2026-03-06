import React from "react";
import Navbar from "../components/Navbar";
import TicketCard from "../components/TicketCard";

const TicketPage = () => {

  const ticket = {
    exhibition: "The Modern Wing",
    gallery: "Curation Alpha",
    tickets: 1,
    date: "12 May 2026",
    time: "10:00 AM",
    ticketId: "MUSEO-928374"
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