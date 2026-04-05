import React, { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import "../styles/Dashboard.css";
import { useNavigate } from "react-router-dom";

// ─── Ticket type config ───────────────────────────────────
const TICKET_TYPES = [
  { key: "adult",  label: "Adult",  emoji: "🧑" },
  { key: "child",  label: "Child",  emoji: "🧒" },
  { key: "senior", label: "Senior", emoji: "👴" },
];

// ─── Helper: render ticket breakdown ─────────────────────
function TicketBreakdown({ tickets }) {
  if (!tickets || typeof tickets !== "object") return null;

  const entries = TICKET_TYPES.filter(({ key }) => tickets[key] > 0);
  const fallback = Object.entries(tickets).filter(([, v]) => v > 0);

  if (entries.length === 0 && fallback.length === 0) return null;

  return (
    <span className="ticket-breakdown">
      {entries.length > 0
        ? entries.map(({ key, label, emoji }) => (
            <span key={key} className="ticket-type-badge">
              {emoji} {label} ×{tickets[key]}
            </span>
          ))
        : fallback.map(([key, val]) => (
            <span key={key} className="ticket-type-badge">
              🎫 {key} ×{val}
            </span>
          ))}
    </span>
  );
}

// ─── Helper: total tickets ────────────────────────────────
function getTotalTickets(booking) {
  const t = booking?.tickets;
  if (t && typeof t === "object") {
    const sum = Object.values(t).reduce((a, b) => a + (Number(b) || 0), 0);
    if (sum > 0) return sum;
  }
  return booking?.num_tickets ?? booking?.quantity ?? 1;
}

// ─── Confirm cancel modal ─────────────────────────────────
function CancelModal({ ticket, onConfirm, onClose, cancelling }) {
  return (
    <div style={styles.modalOverlay}>
      <div style={styles.modalBox}>
        <h3 style={styles.modalTitle}>Cancel Booking?</h3>
        <p style={styles.modalSub}>
          <strong>{ticket.museum_name}</strong>
          <br />
          📅 {ticket.visit_date} &nbsp;·&nbsp; 🕐 {ticket.time_slot}
        </p>
        <p style={styles.modalWarn}>
          ⚠️ This action cannot be undone.
        </p>
        <div style={styles.modalActions}>
          <button style={styles.btnKeep} onClick={onClose} disabled={cancelling}>
            Keep Booking
          </button>
          <button style={styles.btnCancel} onClick={onConfirm} disabled={cancelling}>
            {cancelling ? "Cancelling..." : "Yes, Cancel"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Dropdown ticket list ─────────────────────────────────
function TicketDropdown({ tickets, loading, type, onCancelSuccess }) {
  const [confirmTicket, setConfirmTicket] = useState(null);
  const [cancelling, setCancelling]       = useState(false);
  const [cancelledIds, setCancelledIds]   = useState([]);

  if (loading) {
    return <div className="dropdown-box"><p className="dropdown-empty">Loading...</p></div>;
  }
  if (!tickets || tickets.length === 0) {
    return <div className="dropdown-box"><p className="dropdown-empty">No tickets found.</p></div>;
  }

  const handleCancel = async () => {
    if (!confirmTicket) return;
    setCancelling(true);
    try {
      const res = await fetch(
        `http://localhost:8000/api/bookings/${confirmTicket._id}/cancel`,
        { method: "PATCH" }
      );
      if (res.ok) {
        setCancelledIds((prev) => [...prev, confirmTicket._id]);
        onCancelSuccess && onCancelSuccess(confirmTicket._id);
      } else {
        alert("Cancellation failed. Please try again.");
      }
    } catch (err) {
      alert("Network error. Please try again.");
    } finally {
      setCancelling(false);
      setConfirmTicket(null);
    }
  };

  return (
    <>
      <div className="dropdown-box">
        {tickets
          .filter((t) => !cancelledIds.includes(t._id))
          .map((ticket, i) => {
            const total = getTotalTickets(ticket);
            const hasBreakdown =
              ticket.tickets &&
              typeof ticket.tickets === "object" &&
              Object.values(ticket.tickets).some((v) => v > 0);

            // ✅ Cancel button ONLY in upcoming dropdown
            const canCancel = type === "upcoming";

            return (
              <div className="dropdown-ticket" key={ticket._id || i}>
                <div className="dropdown-ticket-left">
                  <h4 className="dropdown-museum">
                    {ticket.museum_name || "Unknown Museum"}
                  </h4>

                  <p className="dropdown-meta">
                    📅 {ticket.visit_date || "No date"}&nbsp;·&nbsp;
                    🕐 {ticket.time_slot || "No time"}
                  </p>

                  <p className="dropdown-meta">
                    🎫 Total: {total}&nbsp;·&nbsp;
                    💰 ₹{ticket.total_amount ?? ticket.amount ?? "—"}
                  </p>

                  {hasBreakdown && (
                    <p className="dropdown-meta breakdown-row">
                      <TicketBreakdown tickets={ticket.tickets} />
                    </p>
                  )}

                  <div style={{ display: "flex", alignItems: "center", gap: "8px", marginTop: "6px", flexWrap: "wrap" }}>
                    <span
                      className={`dropdown-badge ${
                        ticket.payment_status === "paid" ? "badge-paid" : "badge-pending"
                      }`}
                    >
                      {ticket.payment_status?.toUpperCase() || "UNKNOWN"}
                    </span>

                    {/* ✅ Red cancel button — upcoming only */}
                    {canCancel && ticket.payment_status === "paid" && (
                      <button
                        onClick={() => setConfirmTicket(ticket)}
                        style={styles.cancelBtn}
                        onMouseEnter={(e) => (e.target.style.background = "#b91c1c")}
                        onMouseLeave={(e) => (e.target.style.background = "#dc2626")}
                      >
                        ✕ Cancel
                      </button>
                    )}
                  </div>
                </div>

                <div className="dropdown-ticket-right">
                  {ticket.qr_code ? (
                    <img
                      src={`data:image/png;base64,${ticket.qr_code}`}
                      alt="QR"
                      className="dropdown-qr"
                    />
                  ) : (
                    <div className="dropdown-qr-empty">No QR</div>
                  )}
                </div>
              </div>
            );
          })}
      </div>

      {confirmTicket && (
        <CancelModal
          ticket={confirmTicket}
          onConfirm={handleCancel}
          onClose={() => setConfirmTicket(null)}
          cancelling={cancelling}
        />
      )}
    </>
  );
}

// ─── Main Dashboard ───────────────────────────────────────
function Dashboard() {
  const navigate = useNavigate();

  const [stats, setStats] = useState({
    ticketsBooked: 0,
    visitedCount: 0,
    upcomingCount: 0,
    currentBooking: null,
  });

  const [loading, setLoading] = useState(true);
  const [activeCard, setActiveCard] = useState(null);
  const [dropdownData, setDropdownData] = useState({
    tickets: [],
    visited: [],
    upcoming: [],
  });
  const [dropdownLoading, setDropdownLoading] = useState({
    tickets: false,
    visited: false,
    upcoming: false,
  });

  const fetchDashboard = async () => {
    const user_id = localStorage.getItem("user_id");
    if (!user_id) return;
    try {
      const res = await fetch(`http://localhost:8000/api/dashboard/user/${user_id}`);
      if (!res.ok) return;
      const data = await res.json();
      setStats(data);
    } catch (err) {
      console.error("[Dashboard] fetch error:", err);
    }
  };

  useEffect(() => {
    const user_id = localStorage.getItem("user_id");
    if (!user_id) { navigate("/login"); return; }

    const init = async () => {
      await fetchDashboard();
      setLoading(false);
    };
    init();
  }, [navigate]);

  const handleCardClick = async (type) => {
    if (activeCard === type) { setActiveCard(null); return; }
    setActiveCard(type);
    if (dropdownData[type].length > 0) return;

    const user_id = localStorage.getItem("user_id");
    setDropdownLoading((prev) => ({ ...prev, [type]: true }));
    try {
      const res  = await fetch(`http://localhost:8000/api/dashboard/user/${user_id}/${type}`);
      const data = await res.json();
      setDropdownData((prev) => ({ ...prev, [type]: data.tickets || [] }));
    } catch (err) {
      console.error("[Dropdown] fetch error:", err);
    } finally {
      setDropdownLoading((prev) => ({ ...prev, [type]: false }));
    }
  };

  // After cancel: refresh stats + remove ticket from all dropdowns
  const handleCancelSuccess = async (cancelledId) => {
    await fetchDashboard();
    setDropdownData((prev) => ({
      tickets:  prev.tickets.filter((t) => t._id !== cancelledId),
      visited:  prev.visited.filter((t) => t._id !== cancelledId),
      upcoming: prev.upcoming.filter((t) => t._id !== cancelledId),
    }));
  };

  if (loading) {
    return (
      <div style={{ padding: "3rem", textAlign: "center" }}>
        <p className="loading-text">Loading dashboard...</p>
      </div>
    );
  }

  const currentBooking      = stats?.currentBooking;
  const currentTotal        = getTotalTickets(currentBooking);
  const currentHasBreakdown =
    currentBooking?.tickets &&
    typeof currentBooking.tickets === "object" &&
    Object.values(currentBooking.tickets).some((v) => v > 0);

  const cards = [
    { key: "tickets",  icon: "🎟", label: "Tickets Booked", count: stats.ticketsBooked },
    { key: "visited",  icon: "🏛", label: "Visited",         count: stats.visitedCount  },
    { key: "upcoming", icon: "📅", label: "Upcoming",        count: stats.upcomingCount },
  ];

  return (
    <>
      <Navbar />
      <div className="wrapper">
        <h1 className="font-serif text-5xl md:text-6xl leading-tight mb-12 animate">
          The world's greatest legacies,<br />
          <span className="text-neutral-400 dark:text-neutral-500">
            preserved for your private viewing.
          </span>
        </h1>

        {/* STATS + DROPDOWNS */}
        <div className="stats-section animate" style={{ animationDelay: "0.2s" }}>
          <div className="stats-container">
            {cards.map(({ key, icon, label, count }) => (
              <div key={key} className="stat-card-wrapper">
                <div
                  className={`stat-card clickable ${activeCard === key ? "active" : ""}`}
                  onClick={() => handleCardClick(key)}
                >
                  <span>{icon}</span>
                  <p>{label}</p>
                  <h4>{count}</h4>
                  <span className="dropdown-arrow">
                    {activeCard === key ? "▲" : "▼"}
                  </span>
                </div>

                {activeCard === key && (
                  <TicketDropdown
                    tickets={dropdownData[key]}
                    loading={dropdownLoading[key]}
                    type={key}
                    onCancelSuccess={handleCancelSuccess}
                  />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* BUTTONS */}
        <div className="animate" style={{ animationDelay: "0.6s", marginTop: "2rem" }}>
          <button
            onClick={() => navigate("/explore")}
            className="px-6 py-3 bg-black text-white dark:bg-white dark:text-black rounded-full font-bold tracking-widest text-xs uppercase"
          >
            🔍 Explore Museums
          </button>
          <button
            onClick={() => navigate("/book")}
            style={{ marginLeft: "1rem" }}
            className="px-6 py-3 border border-black dark:border-white rounded-full font-bold tracking-widest text-xs uppercase"
          >
            🎟 Book Tickets
          </button>
        </div>

        {/* CURRENT BOOKING */}
        <p className="section-title animate" style={{ animationDelay: "0.3s" }}>
          Current Booking
        </p>

        {currentBooking ? (
          <div
            className="ticket-visual animate"
            style={{
              animationDelay: "0.4s",
              backgroundImage: currentBooking?.image_url
                ? `linear-gradient(to top, rgba(0,0,0,0.85) 40%, rgba(0,0,0,0.2) 100%), url(${currentBooking.image_url})`
                : undefined,
              backgroundSize: "cover",
              backgroundPosition: "center",
            }}
          >
            <div className="ticket-data">
              <div className="ticket-info">
                <h2>{currentBooking.museum_name || "No Museum"}</h2>
                <p style={{ fontSize: "0.7rem", color: "#fff", opacity: "0.8" }}>
                  {currentBooking.visit_date || "No Date"} &bull;{" "}
                  {currentBooking.time_slot || "No Time"}
                </p>
                <p style={{ fontSize: "0.7rem", color: "#fff", opacity: "0.9", marginTop: "4px" }}>
                  🎫 Total: {currentTotal}
                  {currentBooking.total_amount && (
                    <> &nbsp;·&nbsp; 💰 ₹{currentBooking.total_amount}</>
                  )}
                </p>
                {currentHasBreakdown && (
                  <p style={{ fontSize: "0.65rem", color: "#fff", opacity: "0.85", marginTop: "4px" }}>
                    {TICKET_TYPES.filter(({ key }) => currentBooking.tickets[key] > 0).map(({ key, label, emoji }) => (
                      <span key={key} style={{ marginRight: "8px" }}>
                        {emoji} {label} ×{currentBooking.tickets[key]}
                      </span>
                    ))}
                  </p>
                )}
              </div>
              <div className="qr-small">
                {currentBooking.qr_code ? (
                  <img
                    src={`data:image/png;base64,${currentBooking.qr_code}`}
                    style={{ width: "60px" }}
                    alt="QR Code"
                  />
                ) : (
                  <p style={{ fontSize: "10px", opacity: "0.6" }}>No QR</p>
                )}
              </div>
            </div>
          </div>
        ) : (
          <p style={{ opacity: "0.6" }}>No confirmed bookings yet</p>
        )}
      </div>
    </>
  );
}

// ─── Inline styles ────────────────────────────────────────
const styles = {
  cancelBtn: {
    background: "#dc2626",
    color: "#fff",
    border: "none",
    borderRadius: "20px",
    padding: "3px 12px",
    fontSize: "0.7rem",
    fontWeight: "600",
    cursor: "pointer",
    letterSpacing: "0.03em",
    transition: "background 0.15s",
  },
  modalOverlay: {
    position: "fixed",
    inset: 0,
    background: "rgba(0,0,0,0.55)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 1000,
  },
  modalBox: {
    background: "#fff",
    borderRadius: "16px",
    padding: "2rem",
    maxWidth: "360px",
    width: "90%",
    boxShadow: "0 20px 60px rgba(0,0,0,0.25)",
    textAlign: "center",
  },
  modalTitle: {
    fontSize: "1.2rem",
    fontWeight: "700",
    marginBottom: "0.5rem",
    color: "#111",
  },
  modalSub: {
    fontSize: "0.85rem",
    color: "#444",
    marginBottom: "0.75rem",
    lineHeight: "1.6",
  },
  modalWarn: {
    fontSize: "0.78rem",
    color: "#dc2626",
    marginBottom: "1.25rem",
  },
  modalActions: {
    display: "flex",
    gap: "12px",
    justifyContent: "center",
  },
  btnKeep: {
    padding: "8px 20px",
    borderRadius: "20px",
    border: "1.5px solid #ccc",
    background: "#fff",
    color: "#333",
    fontWeight: "600",
    cursor: "pointer",
    fontSize: "0.82rem",
  },
  btnCancel: {
    padding: "8px 20px",
    borderRadius: "20px",
    border: "none",
    background: "#dc2626",
    color: "#fff",
    fontWeight: "600",
    cursor: "pointer",
    fontSize: "0.82rem",
  },
};

export default Dashboard;