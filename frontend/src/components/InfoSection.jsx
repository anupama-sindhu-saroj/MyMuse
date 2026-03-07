export default function InfoSection() {

const features = [
{
number: "01.",
title: "Smart Museum Experience",
desc: "Discover museums, explore exhibitions, and book tickets instantly through a seamless digital platform designed for modern visitors.",
point: "Real-time availability in 40+ museums."
},

{
number: "02.",
title: "Instant Ticket Booking",
desc: "Book museum tickets in just a few clicks without waiting in long queues at the entrance.",
point: "Quick and hassle-free reservations."
},

{
number: "03.",
title: "Explore Exhibitions",
desc: "Browse current and upcoming exhibitions from multiple museums in one place.",
point: "Discover art, history, and culture."
},

{
number: "04.",
title: "Secure Digital Access",
desc: "Receive digital tickets and manage bookings easily with secure payment integration.",
point: "Safe payments and instant confirmations."
}

];

return (

<section className="py-32 px-8 bg-zinc-50 dark:bg-[#050505]">

<div className="max-w-7xl mx-auto space-y-12">

{features.map((item,index)=>(
<div key={index} className="grid md:grid-cols-3 gap-8">

{/* BIG BOX */}
<div className="md:col-span-2 p-16 bg-white dark:bg-zinc-900 rounded-[3rem] border border-zinc-200 dark:border-zinc-800 hover:-translate-y-2 transition-all duration-500">

<h3 className="text-4xl font-serif italic mb-6 text-black dark:text-white">
{item.title}
</h3>

<p className="text-lg text-zinc-500 max-w-xl">
{item.desc}
</p>

</div>

{/* SMALL BOX */}
<div className="p-16 bg-black text-white dark:bg-white dark:text-black rounded-[3rem] flex flex-col justify-between shadow-xl">

<span className="text-4xl font-bold italic">
{item.number}
</span>

<p className="text-sm font-black uppercase tracking-widest">
{item.point}
</p>

</div>

</div>
))}

</div>

</section>

)

}