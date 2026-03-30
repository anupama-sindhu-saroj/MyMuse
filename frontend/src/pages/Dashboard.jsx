import React, { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import "../styles/Dashboard.css";
import { useNavigate } from "react-router-dom";

function Dashboard() {
  const navigate = useNavigate();

  const [stats, setStats] = useState({
    ticketsBooked: 0,
    museumsVisited: 0,
    upcomingCount: 0,
    currentBooking: null,
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const user_id = localStorage.getItem("user_id");

    // ✅ Log so you can see exactly what user_id is being sent
    console.log("[Dashboard] user_id from localStorage:", user_id);

    if (!user_id) {
      navigate("/login");
      return;
    }

    const fetchDashboard = async () => {
      try {
        const url = `http://localhost:8000/api/dashboard/user/${user_id}`;
        console.log("[Dashboard] fetching:", url);

        const res = await fetch(url);
        const contentType = res.headers.get("content-type") || "";

        let data;
        if (contentType.includes("application/json")) {
          data = await res.json();
        } else {
          const text = await res.text();
          throw new Error(`Server error ${res.status}: ${text}`);
        }

        console.log("[Dashboard] API response:", data);

        if (!res.ok) {
          throw new Error(
            data?.message || data?.detail || `Request failed: ${res.status}`
          );
        }

        setStats(data);
      } catch (err) {
        console.error("[Dashboard] fetch error:", err);
        setError(err.message || "Failed to fetch dashboard data");
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, [navigate]);

  if (loading) {
    return (
      <div style={{ padding: "3rem", textAlign: "center" }}>
        <p className="loading-text">Loading dashboard...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ padding: "3rem" }}>
        <p style={{ color: "red", fontWeight: "bold" }}>
          Dashboard failed to load
        </p>
        <pre
          style={{
            fontSize: "0.75rem",
            background: "#fef2f2",
            padding: "1rem",
            borderRadius: "8px",
            whiteSpace: "pre-wrap",
            color: "#991b1b",
            marginTop: "0.5rem",
          }}
        >
          {error}
        </pre>
        <button
          onClick={() => window.location.reload()}
          style={{ marginTop: "1rem" }}
          className="px-6 py-3 bg-black text-white rounded-full font-bold tracking-widest text-xs uppercase"
        >
          Retry
        </button>
      </div>
    );
  }

  const currentBooking = stats?.currentBooking;

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

        {/* STATS */}
        <div
          className="stats-container animate"
          style={{ animationDelay: "0.2s" }}
        >
          <div className="stat-card">
            <span>🎟</span>
            <p>Tickets Booked</p>
            <h4>{stats.ticketsBooked}</h4>
          </div>

          <div className="stat-card">
            <span>🏛</span>
            <p>Museums Visited</p>
            <h4>{stats.museumsVisited}</h4>
          </div>

          <div className="stat-card">
            <span>📅</span>
            <p>Upcoming</p>
            <h4>{stats.upcomingCount}</h4>
          </div>
        </div>

        {/* BUTTONS */}
        <div
          className="animate"
          style={{ animationDelay: "0.6s", marginTop: "2rem" }}
        >
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
        <p
          className="section-title animate"
          style={{ animationDelay: "0.3s" }}
        >
          Current Booking
        </p>

        {currentBooking ? (
          <div
            className="ticket-visual animate"
            style={{ animationDelay: "0.4s" }}
          >
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