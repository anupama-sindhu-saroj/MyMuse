export default function TicketSummary({ show, price, bookingData, finalizeBooking}) {

  // Format date nicely
  const formatDate = (dateStr) => {
    if (!dateStr) return "—"
    try {
      return new Date(dateStr).toLocaleDateString("en-IN", {
        day: "numeric", month: "long", year: "numeric"
      })
    } catch {
      return dateStr
    }
  }

  // Total guest count
  const guestCount = bookingData?.tickets
    ? Object.values(bookingData.tickets).reduce((a, b) => a + b, 0)
    : 0

  return (
    <>
      <div className="bg-zinc-50 dark:bg-zinc-900/50 p-10 rounded-[40px] border border-zinc-200 dark:border-zinc-800 shadow-sm">

        <div className="space-y-8">

          <div>
            <p className="text-[9px] uppercase tracking-widest text-zinc-400 mb-1">
              Institution
            </p>
            <p className="text-3xl serif">
              {bookingData?.museum_name || "Select a Museum"}
            </p>
          </div>

          <div className="flex justify-between border-t border-zinc-200 dark:border-zinc-800 pt-6">

            <div>
              <p className="text-[9px] uppercase tracking-widest text-zinc-400 mb-1">
                Date
              </p>
              <p className="font-bold text-sm">
                {formatDate(bookingData?.visit_date) || "—"}
              </p>
            </div>

            <div className="text-right">
              <p className="text-[9px] uppercase tracking-widest text-zinc-400 mb-1">
                Guests
              </p>
              <p className="font-bold text-sm">
                {guestCount > 0 ? String(guestCount).padStart(2, "0") : "—"}
              </p>
            </div>

          </div>

          {bookingData?.time_slot && (
            <div>
              <p className="text-[9px] uppercase tracking-widest text-zinc-400 mb-1">
                Time Slot
              </p>
              <p className="text-sm font-bold">
                {bookingData.time_slot}
              </p>
            </div>
          )}

          <div>
            <p className="text-[9px] uppercase tracking-widest text-zinc-400 mb-1">
              Experiences
            </p>
            <p className="text-sm italic">
              {show || "General Admittance"}
            </p>
          </div>

          <div className="pt-8 flex justify-between items-end">
            <div>
              <p className="text-[9px] uppercase tracking-widest text-zinc-400">
                Total
              </p>
              <p className="text-5xl font-black tracking-tighter mt-1">
                ₹ {price || 0}
              </p>
            </div>
          </div>

        </div>

      </div>

      <button
        onClick={finalizeBooking}
        disabled={!bookingData || !bookingData.total_amount}
        className="w-full mt-6 py-6 bg-black dark:bg-white text-white dark:text-black font-black uppercase tracking-[0.4em] rounded-[24px] shadow-2xl disabled:opacity-40 disabled:cursor-not-allowed hover:opacity-80 transition"
      >
        Finalize & Pay
      </button>
    </>
  )
}