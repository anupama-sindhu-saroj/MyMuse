// frontend/src/pages/admin/AdminDashboard.jsx
// Single page: platform stats at top, museum selector, then museum-specific analytics

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import {
  AreaChart, Area, BarChart, Bar, RadarChart, Radar, PolarGrid,
  PolarAngleAxis, ResponsiveContainer, XAxis, YAxis, Tooltip,
  CartesianGrid, LineChart, Line,
} from "recharts";

const API   = "http://localhost:8000/api";
const serif = { fontFamily: '"Cormorant Garamond", serif' };
const sans  = { fontFamily: "sans-serif" };

const fmt = (n) =>
  n >= 100000 ? `₹${(n / 100000).toFixed(1)}L`
  : n >= 1000  ? `₹${(n / 1000).toFixed(1)}k`
  : `₹${Math.round(n || 0)}`;

const objToArr = (obj, k, v) =>
  Object.entries(obj || {}).map(([a, b]) => ({ [k]: a, [v]: b }));

// ── Custom chart tooltip ───────────────────────────────────────────────────────
const CT = ({ active, payload, label, prefix = "" }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: "#0d0d0d", border: "0.5px solid rgba(255,255,255,0.12)", borderRadius: 10, padding: "10px 14px" }}>
      <p style={{ ...sans, fontSize: 10, color: "#555", letterSpacing: "0.2em", textTransform: "uppercase", margin: "0 0 4px" }}>{label}</p>
      <p style={{ ...sans, fontSize: 14, color: "#fff", fontWeight: 500, margin: 0 }}>{prefix}{payload[0]?.value?.toLocaleString()}</p>
    </div>
  );
};

// ── Skeleton ──────────────────────────────────────────────────────────────────
const Skel = ({ h = 100, r = 14 }) => (
  <div style={{ height: h, borderRadius: r, background: "rgba(255,255,255,0.04)", animation: "sk 1.5s ease-in-out infinite" }} />
);

// ── Platform KPI card (top section) ──────────────────────────────────────────
const PlatKpi = ({ label, value, accent = "#fff", index }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
    transition={{ delay: 0.05 + index * 0.07, duration: 0.5 }}
    style={{ border: "0.5px solid rgba(255,255,255,0.07)", borderRadius: 20, padding: "24px 26px", background: "rgba(255,255,255,0.02)", position: "relative", overflow: "hidden" }}
  >
    <div style={{ position: "absolute", top: -20, right: -20, width: 80, height: 80, borderRadius: "50%", background: `${accent}08` }} />
    <p style={{ ...sans, fontSize: 9, letterSpacing: "0.4em", textTransform: "uppercase", color: "#444", margin: "0 0 12px" }}>{label}</p>
    <p style={{ ...serif, fontSize: 40, fontWeight: 300, color: accent, lineHeight: 1, margin: 0 }}>{value}</p>
  </motion.div>
);

// ── Museum analytics KPI card ─────────────────────────────────────────────────
const KpiCard = ({ label, value, sub, index }) => (
  <motion.div
    initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
    transition={{ delay: index * 0.06 }}
    style={{ border: "0.5px solid rgba(255,255,255,0.08)", borderRadius: 16, padding: "20px 22px", background: "rgba(255,255,255,0.015)" }}
  >
    <p style={{ ...sans, fontSize: 9, letterSpacing: "0.35em", textTransform: "uppercase", color: "#444", margin: "0 0 10px" }}>{label}</p>
    <p style={{ ...serif, fontSize: 34, fontWeight: 300, color: "#fff", lineHeight: 1, margin: 0 }}>{value}</p>
    {sub && <p style={{ ...sans, fontSize: 11, color: "#333", margin: "6px 0 0" }}>{sub}</p>}
  </motion.div>
);

// ── Insight card ──────────────────────────────────────────────────────────────
const InsightCard = ({ insight, index }) => {
  const cfg = {
    positive: { border: "0.5px solid rgba(52,211,153,0.2)",  bg: "rgba(52,211,153,0.03)",  dot: "#34d399" },
    warning:  { border: "0.5px solid rgba(251,191,36,0.2)",   bg: "rgba(251,191,36,0.03)",   dot: "#fbbf24" },
    neutral:  { border: "0.5px solid rgba(255,255,255,0.07)", bg: "rgba(255,255,255,0.015)", dot: "#444"    },
  }[insight.type] || { border: "0.5px solid rgba(255,255,255,0.07)", bg: "rgba(255,255,255,0.015)", dot: "#444" };

  return (
    <motion.div initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.3 + index * 0.1 }}
      style={{ border: cfg.border, background: cfg.bg, borderRadius: 14, padding: "14px 16px", marginBottom: 8, display: "flex", gap: 12 }}>
      <div style={{ width: 6, height: 6, borderRadius: "50%", background: cfg.dot, flexShrink: 0, marginTop: 5 }} />
      <div>
        <p style={{ ...sans, fontSize: 12, fontWeight: 500, color: "#ddd", margin: "0 0 3px" }}>{insight.title}</p>
        <p style={{ ...sans, fontSize: 11, color: "#555", lineHeight: 1.55, margin: "0 0 5px" }}>{insight.detail}</p>
        <p style={{ ...sans, fontSize: 10, color: "#444", textTransform: "uppercase", letterSpacing: "0.1em", margin: 0 }}>→ {insight.action}</p>
      </div>
    </motion.div>
  );
};

// ── Chart wrapper ─────────────────────────────────────────────────────────────
const ChartCard = ({ title, children, empty, h = 190 }) => (
  <div style={{ border: "0.5px solid rgba(255,255,255,0.08)", borderRadius: 16, padding: "20px", background: "rgba(255,255,255,0.015)" }}>
    <p style={{ ...sans, fontSize: 9, letterSpacing: "0.35em", textTransform: "uppercase", color: "#444", margin: "0 0 16px" }}>{title}</p>
    {empty
      ? <div style={{ height: h, display: "flex", alignItems: "center", justifyContent: "center", color: "#2a2a2a", ...sans, fontSize: 12 }}>No data yet</div>
      : children}
  </div>
);

// ── Divider ───────────────────────────────────────────────────────────────────
const Divider = ({ label }) => (
  <div style={{ display: "flex", alignItems: "center", gap: 16, margin: "40px 0 32px" }}>
    <div style={{ flex: 1, height: "0.5px", background: "rgba(255,255,255,0.06)" }} />
    <p style={{ ...sans, fontSize: 9, letterSpacing: "0.4em", textTransform: "uppercase", color: "#333", margin: 0 }}>{label}</p>
    <div style={{ flex: 1, height: "0.5px", background: "rgba(255,255,255,0.06)" }} />
  </div>
);

// ── MAIN ─────────────────────────────────────────────────────────────────────
export default function AdminDashboard() {
  const navigate   = useNavigate();
  const dropRef    = useRef(null);
  const admin      = JSON.parse(localStorage.getItem("admin") || "{}");
  const token      = localStorage.getItem("adminToken");

  const [museums,         setMuseums]         = useState([]);
  const [platStats,       setPlatStats]       = useState(null);
  const [platLoading,     setPlatLoading]     = useState(true);

  const [search,          setSearch]          = useState("");
  const [dropOpen,        setDropOpen]        = useState(false);
  const [selectedMuseum,  setSelectedMuseum]  = useState(null);

  const [data,            setData]            = useState(null);
  const [loading,         setLoading]         = useState(false);
  const [error,           setError]           = useState(null);
  const [days,            setDays]            = useState(30);
  const [tab,             setTab]             = useState("overview");

  // close dropdown on outside click
  useEffect(() => {
    const handler = (e) => { if (dropRef.current && !dropRef.current.contains(e.target)) setDropOpen(false); };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  useEffect(() => { fetchMuseums(); }, []);
  useEffect(() => { if (selectedMuseum) fetchAnalytics(); }, [selectedMuseum, days]);

  // ── fetch registered museums + compute platform stats ──
  const fetchMuseums = async () => {
    setPlatLoading(true);
    try {
      const res  = await axios.get(`${API}/admin/museums`, { headers: { Authorization: `Bearer ${token}` } });
      const list = res.data.museums || [];
      setMuseums(list);
      setPlatStats({
        totalMuseums:  list.length,
        verified:      list.filter(m => m.isProfileComplete).length,
        cities:        [...new Set(list.map(m => m.location).filter(Boolean))].length,
        newThisMonth:  list.filter(m => {
          if (!m.created_at) return false;
          const d = new Date(m.created_at);
          const now = new Date();
          return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
        }).length,
      });
      if (list.length > 0) { setSelectedMuseum(list[0]); setSearch(list[0].museumName); }
    } catch (e) {
      console.error("Museums fetch failed:", e.response?.data || e.message);
    } finally {
      setPlatLoading(false);
    }
  };

  const fetchAnalytics = async () => {
    setLoading(true); setError(null);
    try {
      const res = await axios.get(
        `${API}/analytics/museum/${selectedMuseum.id}?days=${days}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setData(res.data.data);
    } catch (e) {
      setError(e.response?.data?.detail || e.response?.data?.message || e.message);
      setData(null);
    } finally {
      setLoading(false);
    }
  };

  const selectMuseum = (m) => { setSelectedMuseum(m); setSearch(m.museumName); setDropOpen(false); setTab("overview"); };
  const logout = () => { localStorage.removeItem("adminToken"); localStorage.removeItem("adminRefreshToken"); localStorage.removeItem("admin"); navigate("/admin"); };

  const filtered = museums.filter(m => m.museumName.toLowerCase().includes(search.toLowerCase()));

  const m      = data?.metrics || {};
  const charts = data?.charts  || {};
  const ai     = data?.ai      || {};

  const revenueData = objToArr(charts.revenue_by_day,   "day",  "revenue");
  const showData    = objToArr(charts.bookings_by_show,  "show", "bookings");
  const hourData    = objToArr(charts.hour_distribution, "hour", "visitors");
  const trendData   = objToArr(charts.revenue_trend,     "week", "revenue");

  return (
    <div style={{ minHeight: "100vh", background: "#080808", color: "#fff" }}>
      <style>{`
        @keyframes sk { 0%,100%{opacity:1} 50%{opacity:.4} }
        * { box-sizing: border-box; margin: 0; padding: 0; }
        ::-webkit-scrollbar { width: 4px; } ::-webkit-scrollbar-track { background: transparent; } ::-webkit-scrollbar-thumb { background: #1a1a1a; border-radius: 4px; }
        option { background: #111; color: #fff; }
      `}</style>

      {/* ── Top Bar ── */}
      <div style={{ borderBottom: "0.5px solid rgba(255,255,255,0.06)", padding: "18px 48px", display: "flex", alignItems: "center", justifyContent: "space-between", background: "#0a0a0a", position: "sticky", top: 0, zIndex: 100 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 28, height: 28, borderRadius: 8, background: "rgba(255,255,255,0.06)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <svg width="14" height="14" fill="none" stroke="rgba(255,255,255,0.4)" strokeWidth="1.5" viewBox="0 0 24 24"><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" strokeLinecap="round" strokeLinejoin="round"/></svg>
          </div>
          <div>
            <span style={{ ...sans, fontSize: 9, letterSpacing: "0.35em", textTransform: "uppercase", color: "#333" }}>MyMuse</span>
            <span style={{ ...sans, fontSize: 9, color: "#222", margin: "0 8px" }}>·</span>
            <span style={{ ...sans, fontSize: 9, letterSpacing: "0.35em", textTransform: "uppercase", color: "#333" }}>Admin</span>
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <div style={{ width: 26, height: 26, borderRadius: "50%", background: "rgba(255,255,255,0.07)", display: "flex", alignItems: "center", justifyContent: "center", ...sans, fontSize: 10, color: "#666" }}>
            {admin?.name?.[0]?.toUpperCase() || "A"}
          </div>
          <span style={{ ...sans, fontSize: 11, color: "#444" }}>{admin?.name || "Admin"}</span>
          <button
    onClick={() => alert("Notifications — coming soon")}
    style={{ background: "none", border: "0.5px solid rgba(255,255,255,0.08)", borderRadius: 8, padding: "5px 10px", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", position: "relative" }}
    onMouseEnter={e => e.currentTarget.style.borderColor = "rgba(255,255,255,0.2)"}
    onMouseLeave={e => e.currentTarget.style.borderColor = "rgba(255,255,255,0.08)"}
    title="Notifications"
  >
    <svg width="14" height="14" fill="none" stroke="rgba(255,255,255,0.4)" strokeWidth="1.5" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 01-3.46 0"/>
    </svg>
    {/* Red dot for unread — remove this div when no notifications */}
    <div style={{ position: "absolute", top: 4, right: 4, width: 5, height: 5, borderRadius: "50%", background: "#f87171" }} />
  </button>
          <button onClick={logout} style={{ background: "none", border: "0.5px solid rgba(255,255,255,0.08)", borderRadius: 8, padding: "5px 12px", ...sans, fontSize: 10, color: "#444", cursor: "pointer", letterSpacing: "0.1em", textTransform: "uppercase" }}>
            Sign out
          </button>
        </div>
      </div>

      <div style={{ padding: "48px 48px 80px", maxWidth: 1280, margin: "0 auto" }}>

        {/* ── Page Title ── */}
        <motion.div initial={{ opacity: 0, y: -14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} style={{ marginBottom: 40 }}>
          <p style={{ ...sans, fontSize: 10, letterSpacing: "0.45em", textTransform: "uppercase", color: "#444", marginBottom: 10 }}>Intelligence Dashboard</p>
          <h1 style={{ ...serif, fontSize: 60, fontWeight: 300, lineHeight: 1, color: "#fff" }}>Platform<br/>Overview.</h1>
        </motion.div>

        {/* ── Platform KPI Strip ── */}
        {platLoading ? (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, minmax(0,1fr))", gap: 12, marginBottom: 12 }}>
            {[...Array(4)].map((_, i) => <Skel key={i} h={110} r={20} />)}
          </div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, minmax(0,1fr))", gap: 12, marginBottom: 12 }}>
            <PlatKpi index={0} label="Registered Museums" value={platStats?.totalMuseums || 0}   accent="#fff" />
            <PlatKpi index={1} label="Profile Complete"   value={platStats?.verified || 0}        accent="#a3a3a3" />
            <PlatKpi index={2} label="Cities Covered"     value={platStats?.cities || 0}          accent="#737373" />
            <PlatKpi index={3} label="Joined This Month"  value={platStats?.newThisMonth || 0}    accent="#525252" />
          </div>
        )}

        {/* ── Museum List Strip ── */}
        {!platLoading && museums.length > 0 && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.35 }}
            style={{ border: "0.5px solid rgba(255,255,255,0.06)", borderRadius: 16, overflow: "hidden", marginBottom: 0 }}>
            {museums.slice(0, 5).map((mus, i) => (
              <div key={mus.id}
                onClick={() => { selectMuseum(mus); document.getElementById("museum-analytics-section")?.scrollIntoView({ behavior: "smooth" }); }}
                style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "13px 20px", borderBottom: i < Math.min(museums.length, 5) - 1 ? "0.5px solid rgba(255,255,255,0.04)" : "none", cursor: "pointer", background: selectedMuseum?.id === mus.id ? "rgba(255,255,255,0.04)" : "transparent", transition: "background 0.15s" }}
                onMouseEnter={e => { if (selectedMuseum?.id !== mus.id) e.currentTarget.style.background = "rgba(255,255,255,0.02)"; }}
                onMouseLeave={e => { if (selectedMuseum?.id !== mus.id) e.currentTarget.style.background = "transparent"; }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                  <span style={{ ...sans, fontSize: 11, color: "#333", width: 20, textAlign: "right" }}>#{i + 1}</span>
                  <div>
                    <p style={{ ...sans, fontSize: 13, color: selectedMuseum?.id === mus.id ? "#fff" : "#aaa", marginBottom: 2 }}>{mus.museumName}</p>
                    <p style={{ ...sans, fontSize: 11, color: "#444" }}>{mus.location} · {mus.email}</p>
                  </div>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  {mus.isProfileComplete && (
                    <span style={{ ...sans, fontSize: 9, letterSpacing: "0.2em", textTransform: "uppercase", color: "#34d399", border: "0.5px solid rgba(52,211,153,0.2)", borderRadius: 6, padding: "3px 8px" }}>Complete</span>
                  )}
                  <svg width="14" height="14" fill="none" stroke="#333" strokeWidth="1.5" viewBox="0 0 24 24"><path d="M9 18l6-6-6-6" strokeLinecap="round" strokeLinejoin="round"/></svg>
                </div>
              </div>
            ))}
            {museums.length > 5 && (
              <div style={{ padding: "10px 20px", ...sans, fontSize: 11, color: "#333", textAlign: "center" }}>
                +{museums.length - 5} more museums
              </div>
            )}
          </motion.div>
        )}

        {/* ── Museum Analytics Section ── */}
        <div id="museum-analytics-section">
          <Divider label="Museum Analytics" />

          {/* Museum Selector */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 28, gap: 16 }}>
            <div ref={dropRef} style={{ position: "relative", flex: 1, maxWidth: 400 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, border: "0.5px solid rgba(255,255,255,0.12)", borderRadius: 12, padding: "10px 16px", background: "rgba(255,255,255,0.02)", cursor: "text" }}>
                <svg width="14" height="14" fill="none" stroke="#444" strokeWidth="1.5" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35" strokeLinecap="round"/></svg>
                <input value={search}
                  onChange={e => { setSearch(e.target.value); setDropOpen(true); }}
                  onFocus={() => setDropOpen(true)}
                  placeholder="Search museum..."
                  style={{ background: "none", border: "none", outline: "none", color: "#fff", ...sans, fontSize: 13, width: "100%" }}
                />
                {selectedMuseum && <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#34d399", flexShrink: 0 }} />}
              </div>
              <AnimatePresence>
                {dropOpen && filtered.length > 0 && (
                  <motion.div initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                    style={{ position: "absolute", top: "calc(100% + 6px)", left: 0, right: 0, background: "#0f0f0f", border: "0.5px solid rgba(255,255,255,0.1)", borderRadius: 12, overflow: "hidden", zIndex: 200, maxHeight: 220, overflowY: "auto" }}>
                    {filtered.map(mus => (
                      <div key={mus.id} onClick={() => selectMuseum(mus)}
                        style={{ padding: "11px 16px", cursor: "pointer", borderBottom: "0.5px solid rgba(255,255,255,0.04)", background: selectedMuseum?.id === mus.id ? "rgba(255,255,255,0.05)" : "transparent" }}
                        onMouseEnter={e => e.currentTarget.style.background = "rgba(255,255,255,0.04)"}
                        onMouseLeave={e => e.currentTarget.style.background = selectedMuseum?.id === mus.id ? "rgba(255,255,255,0.05)" : "transparent"}
                      >
                        <p style={{ ...sans, fontSize: 13, color: "#ccc", marginBottom: 2 }}>{mus.museumName}</p>
                        <p style={{ ...sans, fontSize: 11, color: "#444" }}>{mus.location}</p>
                      </div>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Period pills */}
            <div style={{ display: "flex", gap: 6 }}>
              {[7, 30, 90, 365].map(d => (
                <button key={d} onClick={() => setDays(d)}
                  style={{ ...sans, fontSize: 10, letterSpacing: "0.15em", textTransform: "uppercase", border: "0.5px solid", borderColor: days === d ? "#fff" : "rgba(255,255,255,0.1)", background: days === d ? "#fff" : "transparent", color: days === d ? "#000" : "#555", borderRadius: 99, padding: "6px 14px", cursor: "pointer", transition: "all 0.15s" }}>
                  {d === 365 ? "1yr" : `${d}d`}
                </button>
              ))}
            </div>
          </div>

          {/* Selected Museum Header */}
          {selectedMuseum && (
            <motion.div key={selectedMuseum.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ marginBottom: 24 }}>
              <p style={{ ...sans, fontSize: 9, letterSpacing: "0.4em", textTransform: "uppercase", color: "#444", marginBottom: 6 }}>Viewing</p>
              <h2 style={{ ...serif, fontSize: 44, fontWeight: 300, color: "#fff", lineHeight: 1.05, marginBottom: 4 }}>{selectedMuseum.museumName}</h2>
              <p style={{ ...sans, fontSize: 12, color: "#444" }}>{selectedMuseum.location} · Last {days} days · Data isolated to this museum</p>
            </motion.div>
          )}

          {/* Error */}
          {error && (
            <div style={{ border: "0.5px solid rgba(248,113,113,0.25)", background: "rgba(248,113,113,0.04)", borderRadius: 12, padding: "14px 18px", marginBottom: 20, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ ...sans, fontSize: 12, color: "#f87171" }}>Error: {error}</span>
              <button onClick={fetchAnalytics} style={{ background: "none", border: "0.5px solid rgba(248,113,113,0.3)", color: "#f87171", borderRadius: 6, padding: "3px 10px", cursor: "pointer", ...sans, fontSize: 11 }}>Retry</button>
            </div>
          )}

          {/* AI Headline */}
          {selectedMuseum && (
            loading ? <div style={{ marginBottom: 24 }}><Skel h={80} r={16} /></div>
            : !error && ai.headline ? (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                style={{ border: "0.5px solid rgba(255,255,255,0.06)", borderRadius: 16, padding: "20px 26px", marginBottom: 24, background: "rgba(255,255,255,0.015)" }}>
                <p style={{ ...sans, fontSize: 9, letterSpacing: "0.4em", textTransform: "uppercase", color: "#444", marginBottom: 8 }}>AI Summary</p>
                <p style={{ ...serif, fontSize: 20, fontWeight: 300, color: "#bbb", lineHeight: 1.55 }}>"{ai.headline}"</p>
              </motion.div>
            ) : null
          )}

          {/* Tabs */}
          {selectedMuseum && (
            <div style={{ display: "flex", gap: 2, marginBottom: 24, borderBottom: "0.5px solid rgba(255,255,255,0.06)" }}>
              {["overview", "shows", "users"].map(t => (
                <button key={t} onClick={() => setTab(t)}
                  style={{ ...sans, fontSize: 11, letterSpacing: "0.2em", textTransform: "uppercase", background: "none", border: "none", color: tab === t ? "#fff" : "#444", cursor: "pointer", padding: "8px 18px", borderBottom: tab === t ? "1px solid #fff" : "1px solid transparent", marginBottom: "-0.5px", transition: "color 0.15s" }}>
                  {t}
                </button>
              ))}
            </div>
          )}

          {/* ── OVERVIEW TAB ── */}
          {selectedMuseum && tab === "overview" && (
            <>
              {loading ? (
                <div style={{ display: "grid", gridTemplateColumns: "repeat(4, minmax(0,1fr))", gap: 10, marginBottom: 24 }}>
                  {[...Array(8)].map((_, i) => <Skel key={i} h={105} />)}
                </div>
              ) : !error && (
                <div style={{ display: "grid", gridTemplateColumns: "repeat(4, minmax(0,1fr))", gap: 10, marginBottom: 24 }}>
                  <KpiCard index={0} label="Total Bookings"    value={m.total_bookings?.toLocaleString()  || "0"} sub="all statuses" />
                  <KpiCard index={1} label="Revenue"           value={fmt(m.total_revenue || 0)}                  sub="paid only" />
                  <KpiCard index={2} label="Paid Bookings"     value={m.paid_bookings?.toLocaleString()   || "0"} sub="confirmed payments" />
                  <KpiCard index={3} label="Unique Users"      value={m.unique_users?.toLocaleString()    || "0"} sub="distinct visitors" />
                  <KpiCard index={4} label="Cancellation Rate" value={`${m.cancellation_rate || 0}%`}             sub="of all bookings" />
                  <KpiCard index={5} label="Avg Ticket"        value={`₹${m.avg_ticket_value || 0}`}             sub="per paid booking" />
                  <KpiCard index={6} label="Cancellations"     value={m.total_cancellations  || "0"}             sub="refund events" />
                  <KpiCard index={7} label="Conversion"        value={`${m.conversion || 0}%`}                   sub="paid ÷ total" />
                </div>
              )}

              {!loading && !error && (
                <>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 12 }}>
                    <ChartCard title="Revenue — Last 7 Days" empty={revenueData.length === 0}>
                      <ResponsiveContainer width="100%" height={190}>
                        <AreaChart data={revenueData}>
                          <defs>
                            <linearGradient id="rg" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%"  stopColor="#fff" stopOpacity={0.1} />
                              <stop offset="95%" stopColor="#fff" stopOpacity={0}   />
                            </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" />
                          <XAxis dataKey="day"     tick={{ fill: "#333", fontSize: 10 }} axisLine={false} tickLine={false} />
                          <YAxis dataKey="revenue" tick={{ fill: "#333", fontSize: 10 }} axisLine={false} tickLine={false} tickFormatter={v => `₹${(v/1000).toFixed(0)}k`} />
                          <Tooltip content={<CT prefix="₹" />} />
                          <Area type="monotone" dataKey="revenue" stroke="#666" strokeWidth={1.5} fill="url(#rg)" dot={{ r: 3, fill: "#888", strokeWidth: 0 }} />
                        </AreaChart>
                      </ResponsiveContainer>
                    </ChartCard>

                    <ChartCard title="Bookings by Show" empty={showData.length === 0}>
                      <ResponsiveContainer width="100%" height={190}>
                        <BarChart data={showData} barSize={20}>
                          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" />
                          <XAxis dataKey="show"     tick={{ fill: "#333", fontSize: 10 }} axisLine={false} tickLine={false} />
                          <YAxis dataKey="bookings" tick={{ fill: "#333", fontSize: 10 }} axisLine={false} tickLine={false} />
                          <Tooltip content={<CT />} />
                          <Bar dataKey="bookings" fill="rgba(255,255,255,0.7)" radius={[4, 4, 0, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    </ChartCard>
                  </div>

                  <div style={{ display: "grid", gridTemplateColumns: "5fr 7fr", gap: 12 }}>
                    <ChartCard title="Peak Booking Hours" empty={hourData.length === 0} h={210}>
                      <ResponsiveContainer width="100%" height={210}>
                        <RadarChart data={hourData}>
                          <PolarGrid stroke="rgba(255,255,255,0.05)" />
                          <PolarAngleAxis dataKey="hour" tick={{ fill: "#333", fontSize: 10 }} />
                          <Radar dataKey="visitors" stroke="#555" fill="#fff" fillOpacity={0.06} strokeWidth={1} />
                        </RadarChart>
                      </ResponsiveContainer>
                    </ChartCard>

                    <div>
                      <p style={{ ...sans, fontSize: 9, letterSpacing: "0.35em", textTransform: "uppercase", color: "#444", marginBottom: 14 }}>AI Insights</p>
                      {(ai.insights || []).length === 0
                        ? <div style={{ color: "#2a2a2a", ...sans, fontSize: 12, border: "0.5px solid rgba(255,255,255,0.05)", borderRadius: 12, padding: "20px", textAlign: "center" }}>No insights yet — add bookings first.</div>
                        : ai.insights.map((ins, i) => <InsightCard key={i} insight={ins} index={i} />)
                      }
                    </div>
                  </div>
                </>
              )}
            </>
          )}

          {/* ── SHOWS TAB ── */}
          {selectedMuseum && tab === "shows" && (
            <div style={{ border: "0.5px solid rgba(255,255,255,0.07)", borderRadius: 16, overflow: "hidden" }}>
              <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr 1fr", padding: "12px 22px", borderBottom: "0.5px solid rgba(255,255,255,0.06)", background: "rgba(255,255,255,0.02)" }}>
                {["Show Name", "Bookings", "Est. Revenue", "Cancellations"].map(h => (
                  <p key={h} style={{ ...sans, fontSize: 9, letterSpacing: "0.3em", textTransform: "uppercase", color: "#444" }}>{h}</p>
                ))}
              </div>
              {showData.length === 0
                ? <p style={{ padding: 30, textAlign: "center", color: "#333", ...sans, fontSize: 12 }}>No bookings found for this museum in the selected period.</p>
                : showData.map((s, i) => (
                  <div key={i} style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr 1fr", padding: "14px 22px", borderBottom: "0.5px solid rgba(255,255,255,0.03)", alignItems: "center" }}>
                    <p style={{ ...sans, fontSize: 13, color: "#bbb" }}>{s.show}</p>
                    <p style={{ ...serif, fontSize: 20, color: "#fff" }}>{s.bookings}</p>
                    <p style={{ ...sans, fontSize: 12, color: "#666" }}>₹{(s.bookings * (m.avg_ticket_value || 0)).toLocaleString()}</p>
                    <p style={{ ...sans, fontSize: 12, color: "#666" }}>{Math.round(s.bookings * ((m.cancellation_rate || 0) / 100))}</p>
                  </div>
                ))
              }
            </div>
          )}

          {/* ── USERS TAB ── */}
          {selectedMuseum && tab === "users" && (
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <ChartCard title="Revenue Trend (Weekly)" empty={trendData.every(d => d.revenue === 0)} h={200}>
                <ResponsiveContainer width="100%" height={200}>
                  <LineChart data={trendData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" />
                    <XAxis dataKey="week"    tick={{ fill: "#333", fontSize: 10 }} axisLine={false} tickLine={false} />
                    <YAxis dataKey="revenue" tick={{ fill: "#333", fontSize: 10 }} axisLine={false} tickLine={false} tickFormatter={v => `₹${(v/1000).toFixed(0)}k`} />
                    <Tooltip content={<CT prefix="₹" />} />
                    <Line type="monotone" dataKey="revenue" stroke="#777" strokeWidth={1.5} dot={{ r: 3, fill: "#888", strokeWidth: 0 }} />
                  </LineChart>
                </ResponsiveContainer>
              </ChartCard>

              <div style={{ border: "0.5px solid rgba(255,255,255,0.07)", borderRadius: 16, padding: "20px", background: "rgba(255,255,255,0.015)" }}>
                <p style={{ ...sans, fontSize: 9, letterSpacing: "0.35em", textTransform: "uppercase", color: "#444", marginBottom: 16 }}>Booking Stats</p>
                {[
                  { label: "Unique users",      value: m.unique_users        || 0 },
                  { label: "Total bookings",    value: m.total_bookings      || 0 },
                  { label: "Paid bookings",     value: m.paid_bookings       || 0 },
                  { label: "Cancellations",     value: m.total_cancellations || 0 },
                  { label: "Avg ticket",        value: `₹${m.avg_ticket_value || 0}` },
                  { label: "Total revenue",     value: fmt(m.total_revenue   || 0) },
                ].map((row, i) => (
                  <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "11px 0", borderBottom: "0.5px solid rgba(255,255,255,0.04)" }}>
                    <p style={{ ...sans, fontSize: 12, color: "#555" }}>{row.label}</p>
                    <p style={{ ...serif, fontSize: 20, color: "#fff" }}>{row.value}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Footer */}
          {selectedMuseum && !loading && (
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 32, paddingTop: 16, borderTop: "0.5px solid rgba(255,255,255,0.04)" }}>
              <p style={{ ...sans, fontSize: 10, letterSpacing: "0.3em", textTransform: "uppercase", color: "#2a2a2a" }}>
                {selectedMuseum.museumName} · GPT-4 · Last {days}d
              </p>
              <button onClick={fetchAnalytics}
                style={{ ...sans, fontSize: 10, letterSpacing: "0.2em", textTransform: "uppercase", color: "#444", border: "0.5px solid rgba(255,255,255,0.08)", borderRadius: 99, padding: "6px 16px", cursor: "pointer", background: "none", transition: "border-color 0.15s" }}
                onMouseEnter={e => e.currentTarget.style.borderColor = "rgba(255,255,255,0.2)"}
                onMouseLeave={e => e.currentTarget.style.borderColor = "rgba(255,255,255,0.08)"}
              >
                Refresh
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}