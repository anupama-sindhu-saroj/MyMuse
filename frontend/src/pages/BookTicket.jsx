import { useState } from "react";
import TicketNavbar from "../components/TicketNavbar";
import TicketSummary from "../components/TicketSummary";
import BookingChat from "../components/BookingChat";
import "../styles/bookticket.css";

export default function BookTicket() {

  const [show, setShow] = useState("General Admittance");
  const [price, setPrice] = useState(1050);

  return (
    <div className="bg-white text-black dark:bg-[#0a0a0a] dark:text-white min-h-screen">
    
      <TicketNavbar />

      <main className="max-w-[1400px] mx-auto px-6 md:px-12 pt-10">
        
        <div className="mb-10">

          <p className="text-[10px] tracking-[0.5em] font-bold text-zinc-400 mb-4 uppercase">
            Procurement / 2026 Infrastructure
          </p>

          <h2 className="text-6xl md:text-8xl serif leading-[0.9]">
            Secure <br />
            <span className="italic font-light opacity-30">
              Admittance.
            </span>
          </h2>

        </div>

        <div className="grid grid-cols-12 gap-12 items-start">

          <div className="col-span-12 lg:col-span-4">
            <TicketSummary show={show} price={price} />
          </div>

          <div className="col-span-12 lg:col-span-8 lg:pl-12">

            <div id="chat-scroll-container" className="custom-scrollbar">
                <BookingChat setShow={setShow} setPrice={setPrice} />
            </div>

            </div>

        </div>
        <div className="fixed bottom-12 right-6 md:right-12 left-6 md:left-auto md:w-[500px] z-50">

  <div className="relative group">

    <div className="absolute -inset-1 bg-gradient-to-r from-zinc-200 to-zinc-400 dark:from-zinc-800 dark:to-zinc-700 rounded-[30px] opacity-20 blur-xl group-hover:opacity-40 transition duration-1000"></div>

    <form
      onSubmit={(e) => e.preventDefault()}
      className="relative bg-white/90 dark:bg-zinc-900/90 backdrop-blur-2xl border border-zinc-200 dark:border-zinc-800 rounded-[30px] p-2 flex items-center shadow-2xl"
    >

      <input
        type="text"
        placeholder="Speak to Alpha..."
        className="flex-grow bg-transparent px-8 py-5 outline-none font-serif italic text-xl"
      />

      <button
        type="submit"
        className="w-14 h-14 bg-black dark:bg-white text-white dark:text-black rounded-full flex items-center justify-center hover:scale-105 active:scale-95 transition-all"
      >

        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3"/>
        </svg>

      </button>

    </form>

  </div>

</div>
      </main>

    </div>
  );
}