export default function AISidebar() {
    return (
      <aside className="col-span-12 lg:col-span-4">
  
        <div className="glass-panel p-8 rounded-[40px] sticky top-32 shadow-xl border">
  
          <h3 className="text-xl font-bold mb-6">
            Curation Alpha
          </h3>
  
          <div className="space-y-4 mb-8 h-[500px] overflow-y-auto">
  
            <div className="max-w-[85%] bg-zinc-100 dark:bg-zinc-800 p-4 rounded-2xl text-sm">
              Hello! I've curated 6 unique destinations for you today.
            </div>
  
          </div>
  
          <div className="flex gap-2">
  
            <input
              type="text"
              placeholder="Tell me your mood..."
              className="flex-1 border rounded-xl p-4"
            />
  
            <button className="px-4 py-2 bg-black dark:bg-white text-white dark:text-black rounded-xl text-sm font-bold">
              Ask AI
            </button>
  
          </div>
  
        </div>
  
      </aside>
    );
  }