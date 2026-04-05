import React, { useEffect, useState, useCallback } from "react";
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

// ─── Shared Cancel Confirm Modal ──────────────────────────
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
        <p style={styles.modalWarn}>⚠️ This action cannot be undone.</p>
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

// ─── Shared Refund Success Modal ──────────────────────────
function RefundModal({ ticket, onClose }) {
  return (
    <div style={styles.modalOverlay}>
      <div style={styles.modalBox}>
        <div style={{ fontSize: "2.5rem", marginBottom: "0.5rem" }}>✅</div>
        <h3 style={styles.modalTitle}>Booking Cancelled</h3>
        <p style={styles.modalSub}>
          <strong>{ticket.museum_name}</strong><br />
          📅 {ticket.visit_date} · 🕐 {ticket.time_slot}
        </p>
        <p style={{ fontSize: "0.85rem", color: "#065f46", background: "#d1fae5", borderRadius: "10px", padding: "10px 16px", marginBottom: "1rem" }}>
          💰 Refund of <strong>₹{ticket.total_amount}</strong> will be credited to your original payment method within <strong>5–7 business days</strong>.
        </p>
        <button
          style={{ ...styles.btnKeep, width: "100%" }}
          onClick={onClose}
        >
          Got it
        </button>
      </div>
    </div>
  );
}

// ─── Dropdown ticket list ─────────────────────────────────
// All modal state is local here — dropdown is NOT inside overflow:hidden
function TicketDropdown({ tickets, loading, type, onCancelSuccess }) {
  const [confirmTicket, setConfirmTicket] = useState(null);
  const [cancelling, setCancelling]       = useState(false);
  const [cancelledIds, setCancelledIds]   = useState([]);
  const [refundTicket, setRefundTicket]   = useState(null);

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
        {
          method: "PATCH",
          headers: {
            "Authorization": `Bearer ${localStorage.getItem("accessToken") || localStorage.getItem("token")}`
          }
        }
      );
      if (res.ok) {
        setRefundTicket(confirmTicket);
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
                    <span className={`dropdown-badge ${ticket.payment_status === "paid" ? "badge-paid" : "badge-pending"}`}>
                      {ticket.payment_status?.toUpperCase() || "UNKNOWN"}
                    </span>
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

      {/* Modals render here — dropdown is NOT clipped so these show fine */}
      {confirmTicket && (
        <CancelModal
          ticket={confirmTicket}
          onConfirm={handleCancel}
          onClose={() => setConfirmTicket(null)}
          cancelling={cancelling}
        />
      )}

      {refundTicket && (
        <RefundModal
          ticket={refundTicket}
          onClose={() => setRefundTicket(null)}
        />
      )}
    </>
  );
}

// ─── Upcoming Tickets Carousel ────────────────────────────
// NO modal state here — modals are lifted to Dashboard to avoid overflow:hidden clipping
function UpcomingCarousel({ tickets, onRequestCancel, cancelledIds }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [sliding, setSliding] = useState(false);
  const [direction, setDirection] = useState("next");

  const visible = tickets.filter((t) => !cancelledIds.includes(t._id));
  const total = visible.length;

  useEffect(() => {
    if (total <= 1) return;
    const timer = setInterval(() => goTo("next"), 5000);
    return () => clearInterval(timer);
  }, [total, currentIndex]);

  useEffect(() => {
    if (currentIndex >= total && total > 0) {
      setCurrentIndex(total - 1);
    }
  }, [total]);

  const goTo = useCallback((dir) => {
    if (total <= 1 || sliding) return;
    setDirection(dir);
    setSliding(true);
    setTimeout(() => {
      setCurrentIndex((prev) =>
        dir === "next" ? (prev + 1) % total : (prev - 1 + total) % total
      );
      setSliding(false);
    }, 350);
  }, [total, sliding]);

  if (total === 0) {
    return (
      <div style={styles.carouselEmpty}>
        <span style={{ fontSize: "2rem" }}>🎟</span>
        <p style={{ margin: "0.5rem 0 0", opacity: 0.5, fontSize: "0.85rem" }}>
          No upcoming bookings
        </p>
      </div>
    );
  }

  const ticket = visible[currentIndex];
  if (!ticket) return null;

  const totalTickets = getTotalTickets(ticket);
  const hasBreakdown =
    ticket.tickets &&
    typeof ticket.tickets === "object" &&
    Object.values(ticket.tickets).some((v) => v > 0);

  return (
    <>
      <div style={styles.carouselWrapper}>
        <div style={styles.carouselViewport}>
          <div
            key={ticket._id || currentIndex}
            style={{
              ...styles.carouselSlide,
              animation: sliding
                ? `slide-out-${direction} 0.35s ease forwards`
                : `slide-in-${direction} 0.35s ease forwards`,
              ...(ticket.image_url && {
                backgroundImage: `linear-gradient(to top, rgba(0,0,0,0.88) 40%, rgba(0,0,0,0.25) 100%), url(${ticket.image_url})`,
              }),
            }}
          >
            <div style={styles.carouselInfo}>
              <p style={styles.carouselMuseumName}>
                {ticket.museum_name || "Unknown Museum"}
              </p>
              <p style={styles.carouselMeta}>
                📅 {ticket.visit_date || "No date"} &nbsp;·&nbsp; 🕐 {ticket.time_slot || "No time"}
              </p>
              <p style={styles.carouselMeta}>
                🎫 Total: {totalTickets}
                {ticket.total_amount && <> &nbsp;·&nbsp; 💰 ₹{ticket.total_amount}</>}
              </p>
              {hasBreakdown && (
                <p style={{ ...styles.carouselMeta, marginTop: "4px" }}>
                  {TICKET_TYPES.filter(({ key }) => ticket.tickets[key] > 0).map(({ key, label, emoji }) => (
                    <span key={key} style={{ marginRight: "8px" }}>
                      {emoji} {label} ×{ticket.tickets[key]}
                    </span>
                  ))}
                </p>
              )}
              <div style={{ display: "flex", gap: "8px", alignItems: "center", marginTop: "10px", flexWrap: "wrap" }}>
                <span style={styles.paidBadge}>✔ PAID</span>
                {ticket.payment_status === "paid" && (
                  <button
                    onClick={(e) => { e.stopPropagation(); onRequestCancel(ticket); }}
                    style={{ ...styles.cancelBtn, position: "relative", zIndex: 10 }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = "#b91c1c")}
                    onMouseLeave={(e) => (e.currentTarget.style.background = "#dc2626")}
                  >
                    ✕ Cancel
                  </button>
                )}
              </div>
            </div>

            <div style={styles.carouselQR}>
              {ticket.qr_code ? (
                <img
                  src={`data:image/png;base64,${ticket.qr_code}`}
                  style={{ width: "70px", height: "70px", borderRadius: "8px" }}
                  alt="QR Code"
                />
              ) : (
                <div style={styles.noQR}>No QR</div>
              )}
            </div>
          </div>
        </div>

        {total > 1 && (
          <div style={styles.carouselControls}>
            <button
              style={styles.navBtn}
              onClick={() => goTo("prev")}
              onMouseEnter={(e) => (e.currentTarget.style.opacity = "1")}
              onMouseLeave={(e) => (e.currentTarget.style.opacity = "0.6")}
            >‹</button>
            <div style={styles.dots}>
              {visible.map((_, i) => (
                <button
                  key={i}
                  onClick={() => {
                    if (i === currentIndex || sliding) return;
                    setDirection(i > currentIndex ? "next" : "prev");
                    setSliding(true);
                    setTimeout(() => { setCurrentIndex(i); setSliding(false); }, 350);
                  }}
                  style={{
                    ...styles.dot,
                    background: i === currentIndex ? "#fff" : "rgba(255,255,255,0.3)",
                    transform: i === currentIndex ? "scale(1.3)" : "scale(1)",
                  }}
                />
              ))}
            </div>
            <button
              style={styles.navBtn}
              onClick={() => goTo("next")}
              onMouseEnter={(e) => (e.currentTarget.style.opacity = "1")}
              onMouseLeave={(e) => (e.currentTarget.style.opacity = "0.6")}
            >›</button>
          </div>
        )}

        {total > 1 && (
          <div style={styles.counterBadge}>
            {currentIndex + 1} / {total}
          </div>
        )}
      </div>

      <style>{`
        @keyframes slide-in-next  { from { opacity: 0; transform: translateX(60px);  } to { opacity: 1; transform: translateX(0); } }
        @keyframes slide-out-next { from { opacity: 1; transform: translateX(0);     } to { opacity: 0; transform: translateX(-60px); } }
        @keyframes slide-in-prev  { from { opacity: 0; transform: translateX(-60px); } to { opacity: 1; transform: translateX(0); } }
        @keyframes slide-out-prev { from { opacity: 1; transform: translateX(0);     } to { opacity: 0; transform: translateX(60px); } }
      `}</style>
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

  const [upcomingTickets, setUpcomingTickets] = useState([]);
  const [upcomingPanelLoading, setUpcomingPanelLoading] = useState(true);

  // ── Carousel modal state lives HERE (outside overflow:hidden) ──
  const [carouselCancelledIds, setCarouselCancelledIds] = useState([]);
  const [carouselConfirmTicket, setCarouselConfirmTicket] = useState(null);
  const [carouselCancelling, setCarouselCancelling] = useState(false);
  const [carouselRefundTicket, setCarouselRefundTicket] = useState(null);

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

  const fetchUpcomingPanel = async () => {
    const user_id = localStorage.getItem("user_id");
    if (!user_id) return;
    setUpcomingPanelLoading(true);
    try {
      const res = await fetch(`http://localhost:8000/api/dashboard/user/${user_id}/upcoming`);
      if (!res.ok) return;
      const data = await res.json();
      setUpcomingTickets(data.tickets || []);
    } catch (err) {
      console.error("[UpcomingPanel] fetch error:", err);
    } finally {
      setUpcomingPanelLoading(false);
    }
  };

  useEffect(() => {
    const user_id = localStorage.getItem("user_id");
    if (!user_id) { navigate("/login"); return; }
    const init = async () => {
      await Promise.all([fetchDashboard(), fetchUpcomingPanel()]);
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

  const handleCancelSuccess = async (cancelledId) => {
    await fetchDashboard();
    setDropdownData((prev) => ({
      tickets:  prev.tickets.filter((t) => t._id !== cancelledId),
      visited:  prev.visited.filter((t) => t._id !== cancelledId),
      upcoming: prev.upcoming.filter((t) => t._id !== cancelledId),
    }));
    setUpcomingTickets((prev) => prev.filter((t) => t._id !== cancelledId));
  };

  // ── Carousel cancel: API call happens here, modal renders here ──
  const handleCarouselConfirmCancel = async () => {
    if (!carouselConfirmTicket) return;
    setCarouselCancelling(true);
    try {
      const res = await fetch(
        `http://localhost:8000/api/bookings/${carouselConfirmTicket._id}/cancel`,
        {
          method: "PATCH",
          headers: {
            "Authorization": `Bearer ${localStorage.getItem("accessToken") || localStorage.getItem("token")}`
          }
        }
      );
      if (res.ok) {
        setCarouselRefundTicket(carouselConfirmTicket);
        setCarouselCancelledIds((prev) => [...prev, carouselConfirmTicket._id]);
        handleCancelSuccess(carouselConfirmTicket._id);
      } else {
        alert("Cancellation failed. Please try again.");
      }
    } catch (err) {
      alert("Network error. Please try again.");
    } finally {
      setCarouselCancelling(false);
      setCarouselConfirmTicket(null);
    }
  };

  if (loading) {
    return (
      <div style={{ padding: "3rem", textAlign: "center" }}>
        <p className="loading-text">Loading dashboard...</p>
      </div>
    );
  }

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

        {/* UPCOMING BOOKINGS CAROUSEL PANEL */}
        <p className="section-title animate" style={{ animationDelay: "0.3s" }}>
          Upcoming Bookings
          {upcomingTickets.length > 0 && (
            <span style={styles.upcomingCount}>{upcomingTickets.length}</span>
          )}
        </p>

        {upcomingPanelLoading ? (
          <div className="ticket-visual animate" style={{ animationDelay: "0.4s", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <p style={{ opacity: 0.5, fontSize: "0.85rem" }}>Loading upcoming tickets...</p>
          </div>
        ) : (
          <div
            className="ticket-visual animate"
            style={{ animationDelay: "0.4s", height: "280px", padding: 0 }}
          >
            <UpcomingCarousel
              tickets={upcomingTickets}
              cancelledIds={carouselCancelledIds}
              onRequestCancel={setCarouselConfirmTicket}
            />
          </div>
        )}
      </div>

      {/* ── Carousel modals rendered at root level — never clipped ── */}
      {carouselConfirmTicket && (
        <CancelModal
          ticket={carouselConfirmTicket}
          onConfirm={handleCarouselConfirmCancel}
          onClose={() => setCarouselConfirmTicket(null)}
          cancelling={carouselCancelling}
        />
      )}

      {carouselRefundTicket && (
        <RefundModal
          ticket={carouselRefundTicket}
          onClose={() => setCarouselRefundTicket(null)}
        />
      )}
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

  // ── Carousel ──
  carouselWrapper: {
    position: "relative",
    width: "100%",
    height: "100%",
  },
  carouselViewport: {
    overflow: "hidden",
    width: "100%",
    height: "100%",
  },
  carouselSlide: {
    display: "flex",
    alignItems: "flex-end",
    justifyContent: "space-between",
    gap: "1rem",
    padding: "1.5rem",
    height: "100%",
    minHeight: "260px",
    backgroundSize: "cover",
    backgroundPosition: "center",
    boxSizing: "border-box",
  },
  carouselInfo: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    justifyContent: "flex-end",
    position: "relative",
    zIndex: 10,
  },
  carouselMuseumName: {
    fontSize: "1.05rem",
    fontWeight: "700",
    color: "#fff",
    margin: "0 0 6px",
    letterSpacing: "-0.01em",
  },
  carouselMeta: {
    fontSize: "0.7rem",
    color: "#fff",
    opacity: 0.85,
    margin: "2px 0",
  },
  carouselQR: {
    flexShrink: 0,
  },
  noQR: {
    width: "70px",
    height: "70px",
    borderRadius: "8px",
    background: "rgba(255,255,255,0.1)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "10px",
    opacity: 0.5,
    color: "#fff",
  },
  carouselControls: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "12px",
    marginTop: "14px",
  },
  navBtn: {
    background: "none",
    border: "none",
    color: "#fff",
    fontSize: "1.6rem",
    cursor: "pointer",
    padding: "0 4px",
    lineHeight: 1,
    opacity: 0.6,
    transition: "opacity 0.15s",
  },
  dots: {
    display: "flex",
    gap: "6px",
    alignItems: "center",
  },
  dot: {
    width: "7px",
    height: "7px",
    borderRadius: "50%",
    border: "none",
    cursor: "pointer",
    padding: 0,
    transition: "background 0.2s, transform 0.2s",
  },
  counterBadge: {
    position: "absolute",
    top: "4px",
    right: "0",
    fontSize: "0.65rem",
    color: "rgba(255,255,255,0.55)",
    fontWeight: "600",
    letterSpacing: "0.05em",
  },
  paidBadge: {
    fontSize: "0.65rem",
    fontWeight: "700",
    background: "rgba(34,197,94,0.25)",
    color: "#86efac",
    borderRadius: "20px",
    padding: "2px 10px",
    letterSpacing: "0.06em",
  },
  carouselEmpty: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    padding: "1.5rem",
    color: "#fff",
  },
  upcomingCount: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    background: "rgba(255,255,255,0.15)",
    borderRadius: "20px",
    fontSize: "0.7rem",
    fontWeight: "700",
    padding: "1px 9px",
    marginLeft: "8px",
    verticalAlign: "middle",
  },
};

export default Dashboard;
