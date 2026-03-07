export default function MuseumCard({ museum, openDetails }) {

    return (
      <div className="museum-card group" data-title={museum.title}>
  
        <div className="overflow-hidden rounded-3xl aspect-[4/5] mb-4 bg-zinc-100 dark:bg-zinc-800">
          <img
            src={museum.img}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
          />
        </div>
  
        <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">
          {museum.city}
        </p>
  
        <h4 className="text-2xl serif mt-2">
          {museum.title}
        </h4>
  
        <div className="flex gap-4 mt-6">
  
          <button
            onClick={() => openDetails(museum.title, museum.desc)}
            className="flex-1 border-b border-black dark:border-white py-2 text-[10px] font-bold uppercase text-left opacity-60 hover:opacity-100"
          >
            Details
          </button>
  
          <button className="px-6 py-2 bg-black dark:bg-white text-white dark:text-black text-[10px] font-bold uppercase rounded-full">
            Book Ticket
          </button>
  
        </div>
  
      </div>
    );
  }