import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { GoogleLogin } from "@react-oauth/google";

const API = "http://localhost:5001/api/users";

const UserAuth = () => {

  const [view, setView] = useState("login");
  const [showPassword, setShowPassword] = useState(false);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [otp, setOtp] = useState("");
  const [userId, setUserId] = useState("");

  const navigate = useNavigate();

  const serifFont = { fontFamily: '"Cormorant Garamond", serif' };

  const inputStyle =
    "w-full border border-gray-200 rounded-md px-4 py-3 text-sm focus:outline-none focus:border-black";

  const labelStyle =
    "block text-[10px] uppercase tracking-[0.3em] font-semibold text-gray-400 mb-2";

  const primaryBtn =
    "w-full bg-black text-white py-4 rounded-full uppercase tracking-[0.25em] text-[11px] font-semibold hover:opacity-90 transition";


  /* ---------------- SIGNUP ---------------- */

  const handleSignup = async (e) => {

    e.preventDefault();

    try {

      const res = await axios.post(`${API}/signup`, {
        name,
        email,
        password
      });

      setUserId(res.data.userId);

      setName("");
      setEmail("");
      setPassword("");

      setView("otp");

    } catch (err) {

      alert(err.response?.data?.message || "Signup failed");

    }

  };


  /* ---------------- VERIFY OTP ---------------- */

  const verifyOTP = async (e) => {

    e.preventDefault();

    try {

      await axios.post(`${API}/verify-otp`, {
        userId,
        otp
      });

      alert("Account verified successfully");

      setView("login");

    } catch (err) {

      alert(err.response?.data?.message || "OTP verification failed");

    }

  };


  /* ---------------- LOGIN ---------------- */

  const handleLogin = async (e) => {

    e.preventDefault();

    try {

      const res = await axios.post(`${API}/login`, {
        email,
        password
      });
      const handleLogin = async (e) => {

  e.preventDefault();

  try {

    const res = await axios.post(
      "http://localhost:5001/api/users/login",
      { email, password }
    );

    console.log("LOGIN RESPONSE:", res.data);   // ADD THIS

    localStorage.setItem("accessToken", res.data.accessToken);
    localStorage.setItem("refreshToken", res.data.refreshToken);

    localStorage.setItem("user", JSON.stringify(res.data.user));

    navigate("/dashboard");

  } catch (err) {

    alert(err.response?.data?.message);

  }

};

      const { accessToken, refreshToken, user } = res.data;

      /* SAVE AUTH DATA */

      localStorage.setItem("accessToken", accessToken);
      localStorage.setItem("refreshToken", refreshToken);
      localStorage.setItem("user", JSON.stringify(user));

      alert("Login successful");

      navigate("/dashboard");

    } catch (err) {

      alert(err.response?.data?.message || "Login failed");

    }

  };


  /* ---------------- GOOGLE LOGIN ---------------- */

  const handleGoogleLogin = async (credentialResponse) => {

  try {

    const res = await axios.post(
      "http://localhost:5001/api/users/google-login",
      { token: credentialResponse.credential }
    );

    console.log("GOOGLE LOGIN RESPONSE:", res.data);

    localStorage.setItem("accessToken", res.data.accessToken);
    localStorage.setItem("refreshToken", res.data.refreshToken);

    localStorage.setItem("user", JSON.stringify(res.data.user));

    navigate("/dashboard");

  } catch (error) {

    alert("Google login failed");

  }

};

  return (

    <div className="min-h-screen flex items-center justify-center px-6 bg-gray-50 dark:bg-[#0f0f0f] transition-colors duration-300">

      <div className="w-full max-w-7xl grid md:grid-cols-2 items-center gap-20">


        {/* LEFT PANEL */}

        <div>

          <p className="text-[10px] tracking-[0.4em] uppercase text-gray-400 mb-6">
            Museum Partner Portal
          </p>

          <AnimatePresence mode="wait">

            <motion.div
              key={view}
              initial={{ x: 40, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -40, opacity: 0 }}
              transition={{ duration: 0.35 }}
            >


              {/* LOGIN */}

              {view === "login" && (

                <div className="space-y-8">

                  <h1 className="text-7xl leading-none" style={serifFont}>
                    Welcome<br />Back.
                  </h1>

                  <p className="text-gray-500">
                    Login to manage your museum's digital infrastructure.
                  </p>

                  <form className="space-y-6" onSubmit={handleLogin}>

                    <Field
                      label="Email Address"
                      type="email"
                      placeholder="user@gmail.com"
                      style={inputStyle}
                      lStyle={labelStyle}
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />

                    <div className="relative">

                      <Field
                        label="Password"
                        type={showPassword ? "text" : "password"}
                        placeholder="••••••••"
                        style={inputStyle}
                        lStyle={labelStyle}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                      />

                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-4 top-[36px] text-xs text-gray-400 uppercase"
                      >
                        {showPassword ? "Hide" : "Show"}
                      </button>

                    </div>

                    <div className="flex justify-between text-xs text-gray-500">

                      <label className="flex items-center gap-2">
                        <input type="checkbox" />
                        Remember me
                      </label>

                      <Link to="/user-forgot-password" className="uppercase">
                        Forgot password?
                      </Link>

                    </div>

                    <button className={primaryBtn}>
                      Login to Dashboard
                    </button>

                    <div className="flex justify-center mt-4">

                      <GoogleLogin
                        onSuccess={handleGoogleLogin}
                        onError={() => console.log("Google Login Failed")}
                      />

                    </div>

                  </form>

                  <p className="text-xs text-gray-400 uppercase text-center">
                    Don't have an account?
                  </p>

                  <button
                    onClick={() => setView("signup")}
                    className="text-sm font-semibold uppercase tracking-wide block mx-auto"
                  >
                    Sign up
                  </button>

                </div>

              )}


              {/* SIGNUP */}

              {view === "signup" && (

                <div className="space-y-6">

                  <h1 className="text-5xl" style={serifFont}>
                    Join The Circle.
                  </h1>

                  <form className="space-y-5" onSubmit={handleSignup}>

                    <Field
                      label="Full Name"
                      type="text"
                      placeholder="John Doe"
                      style={inputStyle}
                      lStyle={labelStyle}
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                    />

                    <Field
                      label="Email Address"
                      type="email"
                      placeholder="email@example.com"
                      style={inputStyle}
                      lStyle={labelStyle}
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />

                    <Field
                      label="Password"
                      type="password"
                      placeholder="••••••••"
                      style={inputStyle}
                      lStyle={labelStyle}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                    />

                    <button className={primaryBtn}>
                      Register
                    </button>

                  </form>

                  <button
                    onClick={() => setView("login")}
                    className="text-xs text-gray-500 uppercase block mx-auto"
                  >
                    Already registered? Log in
                  </button>

                </div>

              )}


              {/* OTP */}

              {view === "otp" && (

                <div className="space-y-6">

                  <h1 className="text-5xl" style={serifFont}>
                    Verify Email
                  </h1>

                  <p className="text-gray-500">
                    Enter the OTP sent to your email.
                  </p>

                  <form onSubmit={verifyOTP} className="space-y-5">

                    <input
                      type="text"
                      placeholder="Enter OTP"
                      maxLength="6"
                      className={inputStyle}
                      value={otp}
                      onChange={(e) => setOtp(e.target.value)}
                      required
                    />

                    <button className={primaryBtn}>
                      Verify OTP
                    </button>

                  </form>

                </div>

              )}

            </motion.div>

          </AnimatePresence>

        </div>


        {/* RIGHT IMAGE */}

        <div className="hidden md:flex justify-center items-center h-full">

          <div className="relative w-[500px] h-[680px] rounded-[40px] overflow-hidden shadow-xl">

            <motion.img
              initial={{ opacity: 0, scale: 1.1 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 1.5 }}
              src="https://images.unsplash.com/photo-1490750967868-88aa4486c946?auto=format&fit=crop&q=80&w=1200"
              className="absolute inset-0 w-full h-full object-cover"
              alt="Museum"
            />

          </div>

        </div>

      </div>

    </div>

  );

};


const Field = ({ label, type, placeholder, style, lStyle, value, onChange }) => (

  <div>

    <label className={lStyle}>{label}</label>

    <input
      type={type}
      placeholder={placeholder}
      className={style}
      value={value}
      onChange={onChange}
      required
    />

  </div>

);

export default UserAuth;