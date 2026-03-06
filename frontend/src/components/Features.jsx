export default function Features() {

return (

<section className="py-32 px-8 bg-white dark:bg-black dark:bg-zinc-950">

<div className="max-w-7xl mx-auto">

<div className="text-center mb-24" data-aos="fade-up">

<p className="text-xs uppercase tracking-[0.5em] text-zinc-500 mb-6">
Platform Intelligence
</p>

<h2 className="text-6xl font-serif italic text-black dark:text-white mb-6">
How Museo Works
</h2>

<p className="max-w-2xl mx-auto text-zinc-500 text-lg">
Museo combines AI-driven discovery with seamless booking to transform how visitors explore museums worldwide.
</p>

</div>


<div className="grid md:grid-cols-3 gap-12">

{/* Feature 1 */}

<div
data-aos="fade-up"
data-aos-delay="100"
className="p-12 rounded-3xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 hover:-translate-y-3 transition-all duration-500"
>

<div className="text-5xl mb-6">🧠</div>

<h3 className="text-2xl font-serif italic text-black dark:text-white mb-4">
AI Smart Discovery
</h3>

<p className="text-zinc-500">
Our intelligent system recommends museums and exhibitions based on visitor interests, location, and global trends.
</p>

</div>


{/* Feature 2 */}

<div
data-aos="fade-up"
data-aos-delay="200"
className="p-12 rounded-3xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 hover:-translate-y-3 transition-all duration-500"
>

<div className="text-5xl mb-6">🎟️</div>

<h3 className="text-2xl font-serif italic text-black dark:text-white mb-4">
Instant Ticket Booking
</h3>

<p className="text-zinc-500">
Book museum tickets instantly with real-time availability and skip physical queues with digital access.
</p>

</div>


{/* Feature 3 */}

<div
data-aos="fade-up"
data-aos-delay="300"
className="p-12 rounded-3xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 hover:-translate-y-3 transition-all duration-500"
>

<div className="text-5xl mb-6">🌍</div>

<h3 className="text-2xl font-serif italic text-black dark:text-white mb-4">
Global Museum Network
</h3>

<p className="text-zinc-500">
Access museums, galleries, and cultural institutions across the world from a single intelligent platform.
</p>

</div>

</div>

</div>

</section>

)

}