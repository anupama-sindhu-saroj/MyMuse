import React from "react";

const BookingSummary = ({ bookingData }) => {

  // ✅ Use prop first, fallback to localStorage
  const booking = bookingData || JSON.parse(localStorage.getItem("last_booking") || "{}");
  const loading = !bookingData && Object.keys(booking).length === 0;

  const showName = booking.show_name || "—";
  const museumName = booking.museum_name || "—";
  const visitDate = booking.visit_date || "—";
  const timeSlot = booking.time_slot || "—";
  const tickets = booking.tickets || {};
  const adultCount = tickets.adult || 0;
  const childCount = tickets.child || 0;
  const seniorCount = tickets.senior || 0;

  // ✅ amount comes in paise from API (e.g. 40000), convert to rupees
  const totalAmount = booking.amount
    ? booking.amount / 100
    : booking.total_amount || 0;

  const ticketSummary = [
    adultCount > 0 ? `${adultCount}x Adult` : null,
    childCount > 0 ? `${childCount}x Child` : null,
    seniorCount > 0 ? `${seniorCount}x Senior` : null,
  ].filter(Boolean).join(", ");

  if (loading) return (
    <div className="border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 p-8 rounded-sm">
      <p className="text-neutral-400 text-sm">Loading summary...</p>
    </div>
  );

  return (
    <div className="border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 p-8 rounded-sm">

      <h3 className="font-serif text-3xl mb-8 dark:text-white">Summary</h3>

      <div className="space-y-4 mb-8">

        <div className="flex justify-between text-sm font-sans">
          <span className="text-neutral-500">Exhibition</span>
          <span className="font-medium dark:text-white text-right">
            {showName}<br />
            <span className="text-neutral-400 text-xs">{museumName}</span>
          </span>
        </div>

        <div className="flex justify-between text-sm font-sans">
          <span className="text-neutral-500">Date</span>
          <span className="font-medium dark:text-white">{visitDate}</span>
        </div>

        <div className="flex justify-between text-sm font-sans">
          <span className="text-neutral-500">Time</span>
          <span className="font-medium dark:text-white">{timeSlot}</span>
        </div>

        <div className="flex justify-between text-sm font-sans">
          <span className="text-neutral-500">Tickets</span>
          <span className="font-medium dark:text-white">
            {ticketSummary || "—"}
          </span>
        </div>

      </div>

      <div className="pt-6 border-t border-neutral-200 dark:border-neutral-700 flex justify-between">
        <span className="font-sans text-xs uppercase tracking-[0.35em]">Total</span>
        <span className="font-serif text-3xl italic">
          ₹{totalAmount.toLocaleString("en-IN")}.00
        </span>
      </div>

    </div>
  );
};

export default BookingSummary;