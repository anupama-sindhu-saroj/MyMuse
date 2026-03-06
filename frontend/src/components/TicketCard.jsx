import React from "react";
import { QRCodeCanvas } from "qrcode.react";
import { CheckCircle } from "lucide-react";

/**
 * Props:
 *  - ticket: { exhibition, gallery, tickets, date, time, ticketId, artwork (optional url/import) }
 */
const TicketCard = ({ ticket }) => {
  return (
    <div className="max-w-2xl w-full bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-3xl p-8 shadow-xl flex flex-col gap-6">

      {/* header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-full bg-emerald-50 dark:bg-emerald-900/20">
              <CheckCircle className="text-emerald-600 dark:text-emerald-300" size={26} />
            </div>
            <div>
              <h2 className="font-serif text-3xl md:text-4xl leading-tight text-neutral-900 dark:text-white">
                Booking Confirmed
              </h2>
              <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-1">
                Your ticket has been created — keep this ready at entry
              </p>
            </div>
          </div>
        </div>

        {/* optional artwork small preview */}
        {ticket.artwork && (
          <div className="hidden md:block w-28 h-20 rounded-xl overflow-hidden shadow-sm">
            <img src={ticket.artwork} alt={ticket.exhibition} className="w-full h-full object-cover" />
          </div>
        )}
      </div>

      {/* exhibition info */}
      <div className="grid md:grid-cols-2 gap-6 items-center">
        <div>
          <p className="font-serif text-2xl text-neutral-900 dark:text-white">{ticket.exhibition}</p>
          <p className="text-sm text-neutral-400 dark:text-neutral-500 mt-1">{ticket.gallery}</p>
        </div>

        <div className="bg-neutral-50 dark:bg-neutral-800 border border-neutral-100 dark:border-neutral-700 rounded-xl p-4">
          <div className="grid grid-cols-2 gap-3 text-sm text-neutral-600 dark:text-neutral-300">
            <div>
              <div className="text-xs uppercase tracking-[0.35em] text-neutral-400 dark:text-neutral-500">Tickets</div>
              <div className="mt-1 font-medium text-neutral-900 dark:text-white">{ticket.tickets} Adult</div>
            </div>

            <div>
              <div className="text-xs uppercase tracking-[0.35em] text-neutral-400 dark:text-neutral-500">Date</div>
              <div className="mt-1 font-medium">{ticket.date}</div>
            </div>

            <div>
              <div className="text-xs uppercase tracking-[0.35em] text-neutral-400 dark:text-neutral-500">Time</div>
              <div className="mt-1 font-medium">{ticket.time}</div>
            </div>

            <div>
              <div className="text-xs uppercase tracking-[0.35em] text-neutral-400 dark:text-neutral-500">Ticket ID</div>
              <div className="mt-1 font-mono text-sm">{ticket.ticketId}</div>
            </div>
          </div>
        </div>
      </div>

      {/* QR + helper text */}
      <div className="flex flex-col items-center gap-4">
        <div className="bg-white p-4 rounded-xl shadow-sm">
          <QRCodeCanvas value={ticket.ticketId} size={180} bgColor="#ffffff" fgColor="#000000" />
        </div>
        <p className="text-xs text-neutral-500 dark:text-neutral-400">
          Present this QR code at the entrance. Valid for the selected date and time.
        </p>
      </div>

      {/* actions */}
      <div className="flex flex-col md:flex-row gap-3 md:gap-4">
        <button
          onClick={() => window.print()}
          className="flex-1 bg-black text-white dark:bg-white dark:text-black py-3 rounded-lg text-sm font-semibold tracking-[0.3em] uppercase"
        >
          Download Ticket
        </button>

        <button
          onClick={() => (window.location.href = "/")}
          className="flex-1 border border-neutral-200 dark:border-neutral-700 py-3 rounded-lg text-sm font-semibold tracking-[0.3em] uppercase text-neutral-700 dark:text-neutral-300"
        >
          Back to Home
        </button>
      </div>

      {/* subtle footer */}
      <div className="text-xs text-neutral-400 dark:text-neutral-500 text-center pt-2">
        Need help? <span className="text-neutral-600 dark:text-neutral-300">support@museo.com</span>
      </div>
    </div>
  );
};

export default TicketCard;