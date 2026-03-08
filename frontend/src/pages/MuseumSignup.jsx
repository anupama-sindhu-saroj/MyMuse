import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import "../styles/museumSignup.css";

export default function MuseumSignup() {

  const [otpVisible, setOtpVisible] = useState(false);
  const [submitEnabled, setSubmitEnabled] = useState(false);

  const museumName = useRef();
  const email = useRef();
  const phone = useRef();
  const location = useRef();
  const password = useRef();
  const confirmPassword = useRef();

  const sendBtn = useRef();

  const otpInputs = useRef([]);

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

  const sendOTP = () => {

    const inputs = [
      museumName.current.value,
      email.current.value,
      phone.current.value,
      location.current.value,
      password.current.value,
      confirmPassword.current.value
    ];

    const allFilled = inputs.every(v => v.trim() !== "");

    if (!allFilled) {
      alert("Please fill all institutional details.");
      return;
    }

    if (password.current.value !== confirmPassword.current.value) {
      alert("Passwords do not match.");
      return;
    }

    setOtpVisible(true);
    setSubmitEnabled(true);

    sendBtn.current.innerText = "Code Dispatched";
    sendBtn.current.classList.replace("text-black", "text-green-700");
  };

  const moveNext = (e, index) => {
    if (e.target.value.length === 1 && index < otpInputs.current.length - 1) {
      otpInputs.current[index + 1].focus();
    }
  };

  useEffect(() => {

    const interval = setInterval(() => {
      setCurrentIndex(prev => (prev + 1) % images.length);
    }, 5000);

    return () => clearInterval(interval);

  }, []);

  return (
    <div className="flex flex-col h-screen overflow-hidden">

      <Navbar />

      <main className="flex-grow flex flex-col lg:flex-row items-center justify-between px-10 lg:px-24 pt-20 pb-8 max-w-[1600px] mx-auto w-full gap-16">

        {/* LEFT SIDE */}
        <div className="w-full lg:w-1/2 space-y-4 fade-in">

          <div className="flex items-center gap-4 mb-2">
            <div className="h-[1px] w-16 bg-black"></div>
            <span className="text-[10px] uppercase tracking-[0.5em] font-bold">
              Registration Phase
            </span>
          </div>

          <div className="space-y-0 pb-2">
            <h1 className="text-7xl lg:text-9xl font-serif italic leading-[0.75]">
              Join
            </h1>
            <h1 className="text-7xl lg:text-9xl font-serif leading-[0.75] -mt-4">
              The Circle.
            </h1>
          </div>

          <form className="max-w-xl space-y-3 pt-2">

            <div className="grid grid-cols-2 gap-3">
              <input ref={museumName} type="text" placeholder="Museum Name" className="museo-input w-full px-5 py-3 rounded-xl text-sm"/>
              <input ref={email} type="email" placeholder="Institutional Email" className="museo-input w-full px-5 py-3 rounded-xl text-sm"/>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <input ref={phone} type="tel" placeholder="Phone Number" className="museo-input w-full px-5 py-3 rounded-xl text-sm"/>
              <input ref={location} type="text" placeholder="Location" className="museo-input w-full px-5 py-3 rounded-xl text-sm"/>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <input ref={password} type="password" placeholder="Password" className="museo-input w-full px-5 py-3 rounded-xl text-sm"/>
              <input ref={confirmPassword} type="password" placeholder="Confirm" className="museo-input w-full px-5 py-3 rounded-xl text-sm"/>
            </div>

            <button
              type="button"
              ref={sendBtn}
              onClick={sendOTP}
              className="w-full py-3.5 border border-black text-black dark:border-white dark:text-white text-[10px] font-bold uppercase tracking-[0.3em] rounded-full hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black transition-all"
            >
              Send Verification Code
            </button>

            {/* OTP SECTION */}
            <div className={`bg-neutral-50 p-5 rounded-2xl border border-neutral-100 space-y-3 shadow-sm ${otpVisible ? "visible" : ""}`} id="otpSection">

              <div className="flex justify-between items-center px-1">
                <label className="text-[10px] uppercase tracking-widest font-bold opacity-50">
                  Identity Verification
                </label>

                <button type="button" className="text-[9px] underline uppercase tracking-widest font-bold hover:opacity-100 transition">
                  Resend OTP
                </button>
              </div>

              <div className="flex gap-4 justify-center">

                {[0,1,2,3].map((i)=>(
                  <input
                    key={i}
                    maxLength="1"
                    ref={el => otpInputs.current[i] = el}
                    onInput={(e)=>moveNext(e,i)}
                    className="otp-box bg-transparent"
                  />
                ))}

              </div>
            </div>

            <button
              type="submit"
              disabled={!submitEnabled}
              className={`w-full py-4 bg-black text-white dark:bg-white dark:text-black text-[11px] font-bold uppercase tracking-[0.4em] rounded-full shadow-2xl ${
                submitEnabled
                ? ""
                : "opacity-20 cursor-not-allowed"
              }`}
            >
              Verify & Initialize Access
            </button>
            <div className="flex items-center justify-center gap-8 pt-2">

              <a href="/museum-login" className="group flex flex-col items-center">
                <span className="text-[9px] uppercase tracking-widest font-bold opacity-40 group-hover:opacity-100 transition">
                  Registered?
                </span>

                <span className="text-[10px] uppercase tracking-[0.2em] font-black border-b border-black/10 group-hover:border-black transition">
                  Login
                </span>
              </a>

                </div>
              </form>
            </div>

        {/* RIGHT SIDE IMAGE SLIDER */}

        <div className="w-full lg:w-1/2 flex justify-center items-center relative">

          <div className="absolute w-[600px] h-[600px] bg-neutral-200/30 blur-[100px] rounded-full -z-10"></div>

          <div className="relative w-full max-w-[500px] aspect-[3/4] rounded-[2rem] overflow-hidden shadow-[0_50px_100px_-20px_rgba(0,0,0,0.15)]">

            <div className="image-container w-full h-full relative">

              {images.map((img,i)=>(
                <img
                  key={i}
                  src={img}
                  className={i === currentIndex ? "active" : ""}
                />
              ))}

            </div>

            <div className="absolute bottom-8 left-8 right-8 bg-white/40 backdrop-blur-xl border border-white/40 p-8 rounded-2xl shadow-sm">

              <p className="text-[10px] uppercase tracking-[0.4em] text-black font-bold opacity-60">
                System Curation
              </p>

              <h3 className="font-serif text-3xl italic mt-2">
                {titles[currentIndex]}
              </h3>

              <div className="mt-4 flex gap-2">

                {images.map((_,i)=>(
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