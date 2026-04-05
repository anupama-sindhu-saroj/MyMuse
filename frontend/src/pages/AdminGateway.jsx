import { useEffect, useRef, useState } from "react";
import axios from "axios";
import Navbar from "../components/Navbar";
import "../styles/adminGateway.css";

export default function AdminGateway() {
  const cardRef = useRef(null);
  const containerRef = useRef(null);
  const [secretKey, setSecretKey] = useState("");
  const [isLogin, setIsLogin] = useState(true);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  useEffect(() => {
    const container = containerRef.current;
    const card = cardRef.current;

    const move = (e) => {
      let xAxis = (window.innerWidth / 2 - e.pageX) / 25;
      let yAxis = (window.innerHeight / 2 - e.pageY) / 25;
      card.style.transform = `rotateY(${xAxis}deg) rotateX(${yAxis}deg)`;
    };

    const leave = () => {
      card.style.transform = `rotateY(0deg) rotateX(0deg)`;
    };

    container.addEventListener("mousemove", move);
    container.addEventListener("mouseleave", leave);

    return () => {
      container.removeEventListener("mousemove", move);
      container.removeEventListener("mouseleave", leave);
    };
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      if (isLogin) {
        // ── LOGIN ──────────────────────────────────────────
        const res = await axios.post(
          "http://localhost:8000/api/admin/login",
          { email, password }
        );

        localStorage.setItem("adminToken", res.data.accessToken);
        localStorage.setItem("adminRefreshToken", res.data.refreshToken);

        alert("Access authorized");
        window.location.href = "/admin-dashboard";

      } else {
        // ── SIGNUP ─────────────────────────────────────────
        await axios.post(
        "http://localhost:8000/api/admin/signup",
        { name, email, password, secret_key: secretKey }
        );

        alert("Admin registered. Please login.");
        setIsLogin(true);
        setName("");
        setEmail("");
        setPassword("");
      }

    } catch (err) {
      alert(err.response?.data?.message || "Authentication failed");
    }
  };

  return (
    <>
      <Navbar minimal={true} />

      <div className="page">
        <div className="orb"></div>

        <div className="auth-wrapper" ref={containerRef}>
          <header className="brand-section">
            <h1 className="logo-text">Museo.</h1>
            <p className="brand-tag">Global Archives & Management</p>
          </header>

          <div className="glass-panel" ref={cardRef}>
            <h3 className="form-title">
              {isLogin ? "Secure Access" : "Initial Setup"}
            </h3>

            <form onSubmit={handleSubmit}>
              {!isLogin && (
              <>
              <div className="input-container">
              <label>Registry Name</label>
              <input
              type="text"
              placeholder="Authorized User"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              />
            </div>
    <div className="input-container">
      <label>Authorization Key</label>
      <input
        type="password"
        placeholder="••••••••••••"
        value={secretKey}
        onChange={(e) => setSecretKey(e.target.value)}
        required
      />
    </div>
  </>
)}

              <div className="input-container">
                <label>Digital ID</label>
                <input
                  type="email"
                  placeholder="admin@museo.cloud"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              <div className="input-container">
                <label>Encrypted Key</label>
                <input
                  type="password"
                  placeholder="••••••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>

              <button type="submit" className="btn-glitch">
                {isLogin ? "Authorize" : "Initialize"}
              </button>
            </form>

            <button
              className="switch-mode"
              onClick={() => setIsLogin(!isLogin)}
            >
              {isLogin
                ? "Register New Administrative ID"
                : "Already Authorized? Sign In"}
            </button>
          </div>

          <div className="status-footer">
            <span className="status-item">Node: 02_Museo</span>
            <span className="status-item">Security: Tier 1</span>
          </div>
        </div>
      </div>
    </>
  );
}