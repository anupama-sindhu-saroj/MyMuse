export default function TicketSummary({ show, price }) {

    return (
      <>
        <div className="bg-zinc-50 dark:bg-zinc-900/50 p-10 rounded-[40px] border border-zinc-200 dark:border-zinc-800 shadow-sm">
  
          <div className="space-y-8">
  
            <div>
              <p className="text-[9px] uppercase tracking-widest text-zinc-400 mb-1">
                Institution
              </p>
  
              <p className="text-3xl serif">
                National Science Museum
              </p>
            </div>
  
            <div className="flex justify-between border-t border-zinc-200 dark:border-zinc-800 pt-6">
  
              <div>
                <p className="text-[9px] uppercase tracking-widest text-zinc-400 mb-1">
                  Date
                </p>
                <p className="font-bold text-sm">
                  March 09, 2026
                </p>
              </div>
  
              <div className="text-right">
                <p className="text-[9px] uppercase tracking-widest text-zinc-400 mb-1">
                  Guests
                </p>
                <p className="font-bold text-sm">
                  03
                </p>
              </div>
  
            </div>
  
            <div>
              <p className="text-[9px] uppercase tracking-widest text-zinc-400 mb-1">
                Experiences
              </p>
  
              <p className="text-sm italic">
                {show}
              </p>
            </div>
  
            <div className="pt-8 flex justify-between items-end">
  
              <div>
                <p className="text-[9px] uppercase tracking-widest text-zinc-400">
                  Total
                </p>
  
                <p className="text-5xl font-black tracking-tighter mt-1">
                  ₹ {price}
                </p>
              </div>
  
            </div>
  
          </div>
  
        </div>
  
        <button className="w-full mt-6 py-6 bg-black dark:bg-white text-white dark:text-black font-black uppercase tracking-[0.4em] rounded-[24px] shadow-2xl">
          Finalize & Pay
        </button>
      </>
    );
  }