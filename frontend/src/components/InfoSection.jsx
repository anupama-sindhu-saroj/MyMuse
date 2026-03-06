export default function InfoSection(){

return(

<section id="info" className="py-32 px-8 bg-zinc-50 dark:bg-black dark:bg-[#050505]">

<div className="max-w-7xl mx-auto">

<div className="grid md:grid-cols-3 gap-8">

<div className="md:col-span-2 p-16 bg-white dark:bg-zinc-900 rounded-[3rem] border border-zinc-200 dark:border-zinc-800 highlight-glow hover:-translate-y-2 transition-all duration-500">

<h3 className="text-4xl font-serif italic mb-6 text-black dark:text-white animated-gradient underline-animate float-text">
Smart Museum Experience
</h3>

<p className="text-lg text-zinc-500 max-w-xl reveal-text">
Our platform helps visitors discover museums, explore exhibitions, and book tickets instantly for a seamless cultural journey.
</p>

</div>

<div className="p-16 bg-black text-white dark:bg-white dark:text-black rounded-[3rem] flex flex-col justify-between shadow-xl">

<span className="text-4xl font-bold italic float-text text-white dark:text-black">
01.
</span>

<p className="text-sm font-black uppercase tracking-widest">
Real-time availability in 40+ countries.
</p>

</div>

</div>

</div>

</section>

)

}