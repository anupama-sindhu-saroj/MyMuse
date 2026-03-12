import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import "../styles/museumSignup.css";

export default function MuseumLogin() {

  const [showPassword, setShowPassword] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);

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
    }, 5001);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen flex flex-col overflow-x-hidden">

      <Navbar />

      <main className="flex-grow flex flex-col lg:flex-row items-center justify-between px-10 lg:px-24 pt-24 pb-8 max-w-[1600px] mx-auto w-full gap-10 h-[calc(100vh-80px)] overflow-hidden">

        {/* LEFT SIDE */}
        <div className="w-full lg:w-1/2 space-y-10 fade-in">

          <div className="flex items-center gap-4">
            <div className="h-[1px] w-16 bg-black dark:bg-white"></div>
            <span className="text-[10px] uppercase tracking-[0.5em] font-bold">
              Museum Partner Portal
            </span>
          </div>

          <div className="space-y-2">
            <h1 className="text-6xl lg:text-8xl font-serif italic leading-[0.85]">
              Welcome
            </h1>

            <h1 className="text-6xl lg:text-8xl font-serif leading-[0.85]">
              Back.
            </h1>

            <p className="text-sm opacity-50 tracking-wide pt-2">
              Login to manage your museum's digital infrastructure.
            </p>
          </div>

          <form className="max-w-xl space-y-5 pt-2">

            {/* EMAIL */}
            <div className="space-y-2">
              <label className="text-[10px] uppercase tracking-widest font-bold opacity-40 ml-4">
                Email Address
              </label>

              <input
                type="email"
                placeholder="curator@museum.org"
                required
                className="museo-input w-full px-6 py-4 rounded-xl text-sm dark:bg-neutral-900 dark:border-neutral-700"
              />
            </div>

            {/* PASSWORD */}
            <div className="space-y-2">
              <label className="text-[10px] uppercase tracking-widest font-bold opacity-40 ml-4">
                Password
              </label>

              <div className="relative">

                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  required
                  className="museo-input w-full px-6 py-4 rounded-xl text-sm dark:bg-neutral-900 dark:border-neutral-700"
                />

                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-5 top-1/2 -translate-y-1/2 text-[10px] uppercase tracking-widest font-bold opacity-40 hover:opacity-100 transition"
                >
                  {showPassword ? "Hide" : "Show"}
                </button>

              </div>
            </div>

            {/* REMEMBER */}
            <div className="flex items-center justify-between px-2">

              <label className="flex items-center gap-2 cursor-pointer group">
                <input type="checkbox" className="custom-checkbox" />

                <span className="text-[10px] uppercase tracking-widest font-bold opacity-40 group-hover:opacity-100 transition">
                  Remember Me
                </span>
              </label>

              <span className="text-[10px] uppercase tracking-widest font-bold opacity-40 underline underline-offset-4">
                Forgot Password?
              </span>

            </div>

            {/* LOGIN BUTTON */}
            <button
              type="submit"
              className="w-full py-5 bg-black text-white dark:bg-white dark:text-black text-[11px] font-bold uppercase tracking-[0.4em] rounded-full hover:scale-[1.02] transition-all shadow-2xl"
            >
              Login to Dashboard
            </button>

            {/* SIGNUP */}
            <div className="pt-8 border-t border-neutral-100 flex flex-col items-center gap-4">

              <p className="text-[10px] uppercase tracking-widest font-bold opacity-40">
                Don't have an account?
              </p>

              <Link to="/museum-signup" className="group flex flex-col items-center">

                <span className="text-[11px] uppercase tracking-[0.2em] font-black border-b border-black/10 dark:border-white/20 group-hover:border-black dark:group-hover:border-white transition">
                  Sign up your museum
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
                Partner Workspace
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