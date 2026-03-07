import { useState } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";

const UserForgotPassword = () => {

  const [email, setEmail] = useState("");

  const serifFont = { fontFamily: '"Cormorant Garamond", serif' };

  const inputStyle =
    "w-full border-b border-gray-300 dark:border-gray-600 bg-transparent py-3 text-sm focus:outline-none focus:border-black dark:focus:border-white transition-all text-black dark:text-white";

  const labelStyle =
    "block text-[10px] uppercase tracking-[0.2em] font-bold text-gray-400 mb-1";

  const primaryBtn =
    "w-full bg-black dark:bg-white dark:text-black text-white py-4 rounded-full uppercase tracking-[0.2em] text-[11px] font-bold hover:opacity-80 transition-all shadow-xl active:scale-[0.98]";

  return (

    <div className="min-h-screen flex items-center justify-center px-6 bg-gray-50 dark:bg-[#0f0f0f] text-black dark:text-white transition-colors duration-300">

      <div className="w-full max-w-6xl bg-white dark:bg-[#1a1a1a] border border-gray-200 dark:border-gray-700 shadow-2xl grid grid-cols-1 md:grid-cols-2 min-h-[650px]">

        {/* LEFT SIDE */}

        <div className="p-12 lg:p-16 flex flex-col justify-center">

          <motion.div
            initial={{ x: 40, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.35 }}
          >

            <h1 className="text-5xl mb-6" style={serifFont}>
              Forgot Password
            </h1>

            <p className="text-gray-500 text-sm mb-10">
              Enter your email and we'll send you a password reset link.
            </p>

            <form className="space-y-6">

              <div>

                <label className={labelStyle}>
                  Email Address
                </label>

                <input
                  type="email"
                  placeholder="visitor@museo.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={inputStyle}
                  required
                />

              </div>

              <button className={primaryBtn}>
                Send Reset Link
              </button>

            </form>

            <Link
              to="/user-login"
              className="text-[11px] text-gray-500 uppercase tracking-widest block mt-8"
            >
              Back to Login
            </Link>

          </motion.div>

        </div>

        {/* RIGHT SIDE IMAGE */}

        {/* RIGHT SIDE: ARTISTIC VISUAL */}
<div className="hidden md:block relative overflow-hidden group z-10">
  <motion.img
    initial={{ scale: 1.1, opacity: 0 }}
    animate={{ scale: 1, opacity: 1 }}
    transition={{ duration: 1.8, ease: "circOut" }}
    // High-End Moody/Editorial Floral Still Life
    // Concept: Flemish Baroque or Dutch Golden Age floral painting aesthetic
    src="https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?q=80&w=1200" 
    alt="Moody Floral Art"
    className="absolute inset-0 w-full h-full object-cover transition-transform duration-[4000ms] group-hover:scale-105 brightness-[0.7] contrast-[1.1] saturate-[0.8]"
  />

  {/* Gradient Mask for depth and text legibility */}
  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent z-10" />

  {/* Floating Content over Image */}
  <div className="absolute bottom-12 left-12 right-12 z-20 text-white">
     <p className="text-[10px] uppercase tracking-[0.5em] opacity-50 mb-4">Botanical Archive</p>
     
     {/* Theme-Appropriate Quote (Emerson/Nature) */}
     <h3 className="text-4xl italic font-light leading-snug mb-8 tracking-tight" style={serifFont}>
        "The creation <br/> of a thousand forests <br/> is in one acorn."
     </h3>
     
     <div className="flex items-center gap-4">
        <div className="h-[1px] w-12 bg-white/30"></div>
        <span className="text-[9px] uppercase tracking-widest opacity-40">R.W. Emerson</span>
     </div>
  </div>

  <div className="absolute top-12 right-12 text-white/20 text-[9px] uppercase tracking-[1.5em] [writing-mode:vertical-lr] z-20 font-medium">
    MUSEO • SYSTEM • 2026
  </div>
</div>

      </div>

    </div>

  );

};

export default UserForgotPassword;