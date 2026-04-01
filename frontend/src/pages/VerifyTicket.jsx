import { useSearchParams } from "react-router-dom";
import { useEffect, useState } from "react";

export default function VerifyTicket() {
  const [searchParams] = useSearchParams();
  const [ticket, setTicket] = useState(null);
  const ticketId = searchParams.get("id");

  useEffect(() => {
    fetch(`http://localhost:8000/api/ticket/verify?ticket_id=${ticketId}`)
      .then(res => res.json())
      .then(data => setTicket(data))
  }, [ticketId]);

  if (!ticket) return <p>Verifying ticket...</p>;

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="bg-white rounded-2xl p-8 shadow-xl text-center">
        <h1 className="text-3xl font-serif mb-4">
          {ticket.valid ? "✅ Valid Ticket" : "❌ Invalid Ticket"}
        </h1>
        {ticket.valid && (
          <>
            <p>{ticket.show_name}</p>
            <p>{ticket.museum_name}</p>
            <p>{ticket.visit_date} — {ticket.time_slot}</p>
            <p className="font-mono mt-2">{ticketId}</p>
          </>
        )}
      </div>
    </div>
  );
}