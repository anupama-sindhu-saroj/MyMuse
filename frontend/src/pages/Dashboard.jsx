import React from "react";
import Navbar from "../components/Navbar";
import "../styles/Dashboard.css";

function Dashboard() {

  return (
    <>
      <Navbar />

      <div className="wrapper">

        <h1 className="eyecatcher animate">
          The world's <b>greatest</b> legacies,<br />
          preserved for your <i>private</i> viewing.
        </h1>

        <div className="stats-container animate" style={{ animationDelay: "0.2s" }}>

          <div className="stat-card">
            <span>🎟</span>
            <p>Tickets Booked</p>
            <h4>12</h4>
          </div>

          <div className="stat-card">
            <span>🏛</span>
            <p>Museums Visited</p>
            <h4>08</h4>
          </div>

          <div className="stat-card">
            <span>⭐</span>
            <p>Saved</p>
            <h4>24</h4>
          </div>

          <div className="stat-card">
            <span>📅</span>
            <p>Upcoming</p>
            <h4>02</h4>
          </div>

        </div>

        <p className="section-title animate" style={{ animationDelay: "0.3s" }}>
          Current Booking
        </p>

        <div className="ticket-visual animate" style={{ animationDelay: "0.4s" }}>

          <div className="ticket-data">

            <div className="ticket-info">
              <h2>The Louvre, Paris</h2>
              <p style={{ fontSize: "0.7rem", color: "#fff", opacity: "0.8" }}>
                MARCH 12 • 14:00 PM • GATE 2
              </p>
            </div>

            <div className="qr-small">
              <img
                src="https://api.qrserver.com/v1/create-qr-code/?size=80x80&data=MuseoTicket"
                style={{ width: "60px" }}
                alt="QR"
              />
            </div>

          </div>
        </div>

        <div className="animate" style={{ animationDelay: "0.5s" }}>

          <p className="section-title">
            Saved Museums & Upcoming Visits
          </p>

          <div className="entry-row">
            <div>
              <p><b>Vatican Museums</b></p>
              <small style={{ opacity: "0.6" }}>Rome, Italy</small>
            </div>

            <span
              style={{
                fontSize: "0.7rem",
                border: "1px solid var(--border)",
                padding: "5px 10px"
              }}
            >
              ⭐ SAVED
            </span>
          </div>

          <div className="entry-row">
            <div>
              <p><b>The British Museum</b></p>
              <small style={{ opacity: "0.6" }}>
                April 05, 2026
              </small>
            </div>

            <span
              style={{
                fontSize: "0.7rem",
                background: "var(--text)",
                color: "var(--bg)",
                padding: "5px 10px"
              }}
            >
              📅 UPCOMING
            </span>
          </div>

        </div>

      </div>
    </>
  );
}

export default Dashboard;