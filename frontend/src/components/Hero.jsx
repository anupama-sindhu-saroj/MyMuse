export default function Hero(){

return(

<section className="relative min-h-screen flex items-center justify-center px-6 overflow-hidden bg-white dark:bg-black">

<div className="absolute top-1/4 left-1/4 w-96 h-96 bg-zinc-200 dark:bg-white/5 rounded-full blur-[120px] -z-10 animate-pulse"></div>

<div className="max-w-7xl w-full grid lg:grid-cols-12 gap-16 items-center">

<div className="lg:col-span-7" data-aos="fade-right">

<div className="inline-flex items-center gap-4 mb-8">

<span className="h-[1px] w-12 bg-zinc-400 dark:bg-white/40"></span>

<span className="text-[10px] uppercase tracking-[0.5em] font-black text-zinc-600 dark:text-white-glow">
2026 AI Infrastructure
</span>

</div>

<h1 className="text-7xl md:text-[8rem] lg:text-[8rem] font-serif leading-[0.8] tracking-tighter mb-12 text-black dark:text-white">

Discover History<br/>

<span className="italic text-zinc-400 dark:text-zinc-600">

Book Your Journey.

</span>

</h1>

<div className="flex items-center gap-6">

<button className="btn-premium bg-black dark:bg-white text-white dark:text-black px-10 py-4 rounded-full text-xs uppercase tracking-[0.2em] font-black shadow-2xl">
🌐 Choose Language
</button>

<select className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 text-sm px-6 py-4 rounded-full outline-none text-black dark:text-white">

<option>English</option>
<option>Hindi</option>
<option>German</option>
<option>French</option>
<option>Spanish</option>

</select>

</div>

</div>

<div className="lg:col-span-5 relative group" data-aos="zoom-in">

  <div className="aspect-[4/5] overflow-hidden rounded-2xl border-[16px] border-zinc-100 dark:border-zinc-900 shadow-2xl relative">

    <img
      src="https://images.unsplash.com/photo-1547826039-bfc35e0f1ea8?auto=format&fit=crop&q=80"
      className="w-full h-full object-cover grayscale-[0.3] hover:grayscale-0 transition-all duration-700"
      alt="Modern Wing"
    />

    <div className="absolute bottom-6 left-6 right-6 p-6 bg-black/40 dark:bg-black/20 backdrop-blur-md rounded-xl border border-white/10">

      <p className="text-[8px] uppercase tracking-[0.3em] font-black text-white/60 mb-1">
        Curation Alpha
      </p>

      <h4 className="text-white font-serif italic text-xl">
        The Modern Wing
      </h4>

    </div>

  </div>

</div>

</div>

</section>

)

}