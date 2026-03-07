import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";

const UserAuth = () => {

  const [view, setView] = useState("login");
  const [showPassword, setShowPassword] = useState(false);

  const serifFont = { fontFamily: '"Cormorant Garamond", serif' };

  const inputStyle =
    "w-full border border-gray-200 rounded-md px-4 py-3 text-sm focus:outline-none focus:border-black";

  const labelStyle =
    "block text-[10px] uppercase tracking-[0.3em] font-semibold text-gray-400 mb-2";

  const primaryBtn =
    "w-full bg-black text-white py-4 rounded-full uppercase tracking-[0.25em] text-[11px] font-semibold hover:opacity-90 transition";

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
                    Welcome<br/>Back.
                  </h1>

                  <p className="text-gray-500">
                    Login to manage your museum's digital infrastructure.
                  </p>

                  <form className="space-y-6">

                    <Field
                      label="Email Address"
                      type="email"
                      placeholder="curator@museum.org"
                      style={inputStyle}
                      lStyle={labelStyle}
                    />

                    <div className="relative">

                      <Field
                        label="Password"
                        type={showPassword ? "text" : "password"}
                        placeholder="••••••••"
                        style={inputStyle}
                        lStyle={labelStyle}
                      />

                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-4 top-[36px] text-xs text-gray-400 uppercase"
                      >
                        Show
                      </button>

                    </div>

                    {/* Remember + Forgot */}

                    <div className="flex justify-between text-xs text-gray-500">

                      <label className="flex items-center gap-2">
                        <input type="checkbox" />
                        Remember me
                      </label>

                      <Link
                        to="/user-forgot-password"
                        className="uppercase"
                      >
                        Forgot password?
                      </Link>

                    </div>

                    <button className={primaryBtn}>
                      Login to Dashboard
                    </button>

                  </form>

                  <p className="text-xs text-gray-400 uppercase text-center">
                    Don't have an account?
                  </p>

                  <button
                    onClick={() => setView("signup")}
                    className="text-sm font-semibold uppercase tracking-wide block mx-auto"
                  >
                    Sign up your museum
                  </button>

                </div>

              )}

              {/* SIGNUP */}

              {view === "signup" && (

                <div className="space-y-6">

                  <h1 className="text-5xl" style={serifFont}>
                    Join The Circle.
                  </h1>

                  <form className="space-y-5">

                    <Field
                      label="Full Name"
                      type="text"
                      placeholder="John Doe"
                      style={inputStyle}
                      lStyle={labelStyle}
                    />

                    <Field
                      label="Email Address"
                      type="email"
                      placeholder="email@example.com"
                      style={inputStyle}
                      lStyle={labelStyle}
                    />

                    <Field
                      label="Password"
                      type="password"
                      placeholder="••••••••"
                      style={inputStyle}
                      lStyle={labelStyle}
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

            </motion.div>

          </AnimatePresence>

        </div>

        {/* RIGHT PANEL */}

        {/* RIGHT PANEL: ARTISTIC VISUAL */}
<div className="hidden md:flex justify-center items-center h-full relative z-10">
  <div className="relative w-[500px] h-[680px] rounded-[40px] overflow-hidden shadow-[0_50px_100px_-20px_rgba(0,0,0,0.1)] group bg-white">
    
    {/* Light Shade Artistic Floral Image */}
    <motion.img
      initial={{ opacity: 0, scale: 1.1 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 1.5, ease: "easeOut" }}
      // Light, high-end botanical photography
      src="https://images.unsplash.com/photo-1490750967868-88aa4486c946?auto=format&fit=crop&q=80&w=1200" 
      alt="Artistic Florals"
      className="absolute inset-0 w-full h-full object-cover transition-transform duration-[4000ms] group-hover:scale-105 saturate-[0.9] brightness-[1.05]"
    />

    {/* Soft Light Overlay (Replaced the heavy black gradient) */}
    <div className="absolute inset-0 bg-gradient-to-b from-white/20 via-transparent to-white/40 z-10" />
    
    {/* Subtle Dark Vignette at the very bottom just for text legibility */}
    <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent z-15" />

    {/* Floating Glassmorphism Info Card (Lighter Theme) */}
    <motion.div 
      initial={{ y: 20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ delay: 0.5, duration: 0.8 }}
      // Adjusted to be a white glass effect for the light theme
      className="absolute bottom-10 left-8 right-8 bg-white/40 backdrop-blur-2xl border border-white/50 rounded-[30px] p-8 text-black z-20 shadow-xl"
    >
      <div className="flex justify-between items-start mb-6">
        <div>
          <p className="text-[10px] uppercase tracking-[0.5em] text-gray-500 mb-1 font-bold">Nature Archive</p>
          <h3 className="text-4xl font-light tracking-tight italic leading-none" style={serifFont}>
            Ephemeral <br/>Beauty.
          </h3>
        </div>
        <div className="w-10 h-10 rounded-full border border-black/10 flex items-center justify-center">
          <div className="w-1.5 h-1.5 bg-black rounded-full animate-pulse shadow-[0_0_8px_rgba(0,0,0,0.2)]"></div>
        </div>
      </div>

      <p className="text-[11px] leading-relaxed text-gray-600 max-w-[240px] mb-6 tracking-widest font-light">
        BOTANICAL PRESERVATION IN THE DIGITAL AGE.
      </p>

      <div className="flex items-center gap-3">
        <div className="h-[1px] w-8 bg-black/20"></div>
        <span className="text-[9px] uppercase tracking-[0.4em] font-bold text-gray-400">Section No. 104</span>
      </div>
    </motion.div>

    {/* Vertical Branding */}
    <div className="absolute top-10 right-8 text-black/20 text-[9px] uppercase tracking-[1.5em] [writing-mode:vertical-lr] z-20 font-medium">
      MUSEO • BOTANICA
    </div>
  </div>
</div>

      </div>

    </div>

  );
};

const Field = ({ label, type, placeholder, style, lStyle }) => (
  <div>
    <label className={lStyle}>{label}</label>
    <input type={type} placeholder={placeholder} className={style} required />
  </div>
);

export default UserAuth; 