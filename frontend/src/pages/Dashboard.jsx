import React, { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import "../styles/Dashboard.css";
import { useNavigate } from "react-router-dom";

function TicketDropdown({ tickets, loading }) {
  if (loading) {
    return (
      <div className="dropdown-box">
        <p className="dropdown-empty">Loading...</p>
      </div>
    );
  }

  if (!tickets || tickets.length === 0) {
    return (
      <div className="dropdown-box">
        <p className="dropdown-empty">No tickets found.</p>
      </div>
    );
  }

  return (
    <div className="dropdown-box">
      {tickets.map((ticket, i) => (
        <div className="dropdown-ticket" key={ticket._id || i}>
          <div className="dropdown-ticket-left">
            <h4 className="dropdown-museum">{ticket.museum_name || "Unknown Museum"}</h4>
            <p className="dropdown-meta">
              📅 {ticket.visit_date || "No date"} &nbsp;·&nbsp; 🕐 {ticket.time_slot || "No time"}
            </p>
            <p className="dropdown-meta">
              🎫 Qty: {ticket.num_tickets ?? ticket.quantity ?? 1} &nbsp;·&nbsp;
              💰 ₹{ticket.total_amount ?? ticket.amount ?? "—"}
            </p>
            <span
              className={`dropdown-badge ${
                ticket.payment_status === "paid" ? "badge-paid" : "badge-pending"
              }`}
            >
              {ticket.payment_status?.toUpperCase() || "UNKNOWN"}
            </span>
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
      ))}
    </div>
  );
}

function Dashboard() {
  const navigate = useNavigate();

  const [stats, setStats] = useState({
    ticketsBooked: 0,
    museumsVisited: 0,
    upcomingCount: 0,
    currentBooking: null,
  });

  const [loading, setLoading] = useState(true);

  // Which card is open: "tickets" | "visited" | "upcoming" | null
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

  useEffect(() => {
    const user_id = localStorage.getItem("user_id");
    if (!user_id) {
      navigate("/login");
      return;
    }

    const fetchDashboard = async () => {
      try {
        const res = await fetch(
          `http://localhost:8000/api/dashboard/user/${user_id}`
        );

        if (!res.ok) {
          // Server error — show empty dashboard instead of crash
          console.warn("[Dashboard] non-ok response:", res.status);
          setStats({
            ticketsBooked: 0,
            museumsVisited: 0,
            upcomingCount: 0,
            currentBooking: null,
          });
          return;
        }

        const data = await res.json();
        setStats(data);
      } catch (err) {
        // Network error — show empty dashboard instead of crash
        console.error("[Dashboard] fetch error:", err);
        setStats({
          ticketsBooked: 0,
          museumsVisited: 0,
          upcomingCount: 0,
          currentBooking: null,
        });
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, [navigate]);

  const handleCardClick = async (type) => {
    // Toggle off if same card clicked again
    if (activeCard === type) {
      setActiveCard(null);
      return;
    }

    setActiveCard(type);

    // Don't refetch if already loaded
    if (dropdownData[type].length > 0) return;

    const user_id = localStorage.getItem("user_id");
    setDropdownLoading((prev) => ({ ...prev, [type]: true }));

    try {
      const res = await fetch(
        `http://localhost:8000/api/dashboard/user/${user_id}/${type}`
      );
      const data = await res.json();
      setDropdownData((prev) => ({ ...prev, [type]: data.tickets || [] }));
    } catch (err) {
      console.error("[Dropdown] fetch error:", err);
    } finally {
      setDropdownLoading((prev) => ({ ...prev, [type]: false }));
    }
  };

  if (loading) {
    return (
      <div style={{ padding: "3rem", textAlign: "center" }}>
        <p className="loading-text">Loading dashboard...</p>
      </div>
    );
  }

  const currentBooking = stats?.currentBooking;

  const cards = [
    { key: "tickets",  icon: "🎟", label: "Tickets Booked",  count: stats.ticketsBooked  },
    { key: "visited",  icon: "🏛", label: "Museums Visited", count: stats.museumsVisited },
    { key: "upcoming", icon: "📅", label: "Upcoming",        count: stats.upcomingCount  },
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

                {/* Clickable card */}
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

                {/* Dropdown opens below its own card */}
                {activeCard === key && (
                  <TicketDropdown
                    tickets={dropdownData[key]}
                    loading={dropdownLoading[key]}
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
          <div className="ticket-visual animate" style={{ animationDelay: "0.4s" }}>
            <div className="ticket-data">
              <div className="ticket-info">
                <h2>{currentBooking.museum_name || "No Museum"}</h2>
                <p style={{ fontSize: "0.7rem", color: "#fff", opacity: "0.8" }}>
                  {currentBooking.visit_date || "No Date"} &bull;{" "}
                  {currentBooking.time_slot || "No Time"}
                </p>
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

export default Dashboard;