import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import "../styles/museumSignup.css";

export default function ForgotPassword() {

  const [currentIndex, setCurrentIndex] = useState(0);
  const [showRecovery, setShowRecovery] = useState(false);
  const [email, setEmail] = useState("");

  const images = [
    "https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?q=80&w=1200",
    "https://images.unsplash.com/photo-1518998053901-5348d3961a04?q=80&w=1200",
    "https://images.unsplash.com/photo-1549490349-8643362247b5?q=80&w=1200"
  ];

  const titles = [
    "Ephemeral Geometry",
    "The Modern Wing",
    "Chiaroscuro Forms"
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % images.length);
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const initiateRecovery = () => {
    if (email.trim() !== "") {
      setShowRecovery(true);
    } else {
      alert("Please provide your institutional email.");
    }
  };

  return (
    <div className="min-h-screen flex flex-col overflow-hidden">

      <Navbar />

      <main className="flex-grow flex flex-col lg:flex-row items-center justify-between px-10 lg:px-24 pt-24 pb-8 max-w-[1600px] mx-auto w-full gap-10 h-[calc(100vh-80px)] overflow-hidden">

        {/* LEFT SIDE */}

        <div className="w-full lg:w-1/2 space-y-8 fade-in">

          <div className="flex items-center gap-4">
            <div className="h-[1px] w-16 bg-black dark:bg-white"></div>
            <span className="text-[10px] uppercase tracking-[0.5em] font-bold">
              Account Restoration
            </span>
          </div>

          <div className="space-y-1">
            <h1 className="text-6xl lg:text-8xl font-serif italic leading-[0.85]">
              Reset
            </h1>

            <h1 className="text-6xl lg:text-8xl font-serif leading-[0.85]">
              Access.
            </h1>
          </div>

          <form className="max-w-xl space-y-5 pt-2">

            {/* EMAIL */}

            <div className="space-y-2">
              <label className="text-[10px] uppercase tracking-widest font-bold opacity-40 ml-4">
                Museum Email Address
              </label>

              <input
                type="email"
                placeholder="admin@museum.org"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="museo-input w-full px-6 py-4 rounded-xl text-sm dark:bg-neutral-900 dark:border-neutral-700"
              />
            </div>

            {/* SEND OTP */}

            <button
              type="button"
              onClick={initiateRecovery}
              className="w-full py-4 border border-black text-black dark:border-white dark:text-white text-[10px] font-bold uppercase tracking-[0.3em] rounded-full hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black transition-all"
            >
              Send Verification Code
            </button>

            {/* RECOVERY SECTION */}

            {showRecovery && (
              <div className="space-y-5">

                <div className="bg-neutral-50 dark:bg-neutral-900 p-6 rounded-2xl border border-neutral-100 dark:border-neutral-800 space-y-4 shadow-sm">

                  <div className="flex justify-between items-center">
                    <label className="text-[10px] uppercase tracking-widest font-bold opacity-50">
                      Identity Verification
                    </label>

                    <button
                      type="button"
                      className="text-[9px] underline uppercase tracking-widest font-bold"
                    >
                      Resend OTP
                    </button>
                  </div>

                  <div className="flex gap-4 justify-center">

                    {[...Array(4)].map((_, i) => (
                      <input
                        key={i}
                        type="text"
                        maxLength="1"
                        className="otp-box bg-transparent"
                      />
                    ))}

                  </div>
                </div>

                {/* PASSWORD RESET */}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                  <input
                    type="password"
                    placeholder="New Password"
                    className="museo-input w-full px-6 py-4 rounded-xl text-sm dark:bg-neutral-900 dark:border-neutral-700"
                  />

                  <input
                    type="password"
                    placeholder="Confirm Password"
                    className="museo-input w-full px-6 py-4 rounded-xl text-sm dark:bg-neutral-900 dark:border-neutral-700"
                  />

                </div>

                <button
                  type="submit"
                  className="w-full py-5 bg-black text-white dark:bg-white dark:text-black text-[11px] font-bold uppercase tracking-[0.4em] rounded-full shadow-2xl hover:scale-[1.01] transition-all"
                >
                  Update Credentials & Login
                </button>

              </div>
            )}

            {/* RETURN */}

            <div className="pt-6 border-t border-neutral-100 flex flex-col items-center gap-4">

              <Link to="/museum-login" className="group flex flex-col items-center">

                <span className="text-[11px] uppercase tracking-[0.2em] font-black border-b border-black/10 dark:border-white/20 group-hover:border-black dark:group-hover:border-white transition">
                  Return to Login
                </span>

              </Link>

            </div>

          </form>

        </div>

        {/* RIGHT SIDE SLIDER */}

        <div className="w-full lg:w-1/2 flex justify-center items-center relative">

          <div className="absolute w-[600px] h-[600px] bg-neutral-200/30 blur-[100px] rounded-full -z-10"></div>

          <div className="relative w-full max-w-[500px] aspect-[3/4] rounded-[2rem] overflow-hidden shadow-[0_50px_100px_-20px_rgba(0,0,0,0.15)]">

            <div className="image-container w-full h-full relative">

              {images.map((img, i) => (
                <img
                  key={i}
                  src={img}
                  className={i === currentIndex ? "active" : ""}
                />
              ))}

            </div>

            <div className="absolute bottom-8 left-8 right-8 bg-white/40 backdrop-blur-xl border border-white/40 p-8 rounded-2xl shadow-sm">

              <p className="text-[10px] uppercase tracking-[0.4em] text-black font-bold opacity-60">
                Security Protocol
              </p>

              <h3 className="font-serif text-3xl italic mt-2">
                {titles[currentIndex]}
              </h3>

              <div className="mt-4 flex gap-2">

                {images.map((_, i) => (
                  <span
                    key={i}
                    className={`w-2 h-2 rounded-full ${
                      i === currentIndex ? "bg-black" : "bg-black/20"
                    }`}
                  />
                ))}

              </div>

            </div>

          </div>

        </div>

      </main>

    </div>
  );
}