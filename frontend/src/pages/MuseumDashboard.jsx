import React, { useState, useContext, useEffect } from "react";
import { ThemeContext } from "../context/ThemeContext";

const MuseumDashboard = () => {
  const { isDarkMode } = useContext(ThemeContext);
  const [activeTab, setActiveTab] = useState("overview");
  const [museum, setMuseum] = useState(null);
  const [editMode, setEditMode] = useState(false);

  // formData now matches the JSON structure from Photo 2
  const [formData, setFormData] = useState({
    imageUrl: "",
    shows: [], 
    visitors: 0,
    payments: 0,
    cancellations: 0
  });

  useEffect(() => {
    const data = JSON.parse(localStorage.getItem("museum"));
    if (data) {
      setMuseum(data);
      setFormData({
        imageUrl: data.imageUrl || "",
        shows: data.shows || [],
        visitors: data.visitors || 0,
        payments: data.payments || 0,
        cancellations: data.cancellations || 0
      });
    }
  }, []);

  const saveData = () => {
    const updated = { ...museum, ...formData };
    localStorage.setItem("museum", JSON.stringify(updated));
    setMuseum(updated);
    setEditMode(false);
  };

  const addShow = () => {
    const newShow = {
      name: "New Show",
      duration_minutes: 60,
      timings: ["9:00 AM"],
      price: { adult: 0, child: 0, senior: 0 },
      capacity_per_slot: 50,
      is_active: true
    };
    setFormData({ ...formData, shows: [...formData.shows, newShow] });
  };

  const borderClass = isDarkMode ? "border-gray-800" : "border-gray-100";

  return (
    <div className={`min-h-screen flex flex-col font-[Inter] transition-all ${isDarkMode ? "bg-[#0a0a0a] text-white" : "bg-white text-black"}`}>
      
      {/* NAVBAR */}
      <nav className={`px-8 py-6 flex justify-between items-center border-b ${borderClass}`}>
        <h1 className="text-3xl font-semibold tracking-tight italic">Museo.</h1>
        <div className="flex items-center gap-4">
          <p className="text-sm font-medium">{museum?.name || "Museum Admin"}</p>
          <div className={`w-10 h-10 rounded-full border flex items-center justify-center font-bold ${borderClass} bg-gray-50/10`}>
            {museum?.name?.[0] || "M"}
          </div>
        </div>
      </nav>

      <div className="flex flex-1">
        {/* SIDEBAR */}
        <aside className={`w-64 border-r p-8 ${borderClass}`}>
          {["overview", "profile"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`block mb-8 text-xs uppercase tracking-[0.2em] transition-all ${
                activeTab === tab ? "font-bold opacity-100" : "opacity-30 hover:opacity-60"
              }`}
            >
              {tab}
            </button>
          ))}
        </aside>

        {/* MAIN CONTENT */}
        <main className="flex-1 p-14">
          <div className="max-w-5xl">
            
            {/* OVERVIEW TAB */}
            {activeTab === "overview" && (
              <>
                <h1 className="text-5xl font-semibold mb-12 tracking-tighter italic">Dashboard</h1>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <StatBox label="Active Shows" value={formData.shows.length} />
                  <StatBox label="Total Visitors" value={formData.visitors.toLocaleString()} />
                  <StatBox label="Revenue" value={`₹${formData.payments.toLocaleString()}`} color="text-green-500" />
                  <StatBox label="Cancellations" value={formData.cancellations} color="text-red-500" />
                  <StatBox label="System Status" value="Online" color="text-blue-500" />
                </div>
              </>
            )}

            {/* PROFILE TAB */}
            {activeTab === "profile" && (
              <>
                <div className="flex justify-between items-end mb-12">
                  <h2 className="text-5xl font-semibold tracking-tighter italic">Profile</h2>
                  <button 
                    onClick={() => setEditMode(!editMode)} 
                    className={`px-8 py-2 rounded-full text-sm font-medium transition-all ${
                      editMode ? "bg-red-500/10 text-red-500" : "bg-black text-white dark:bg-white dark:text-black"
                    }`}
                  >
                    {editMode ? "Cancel" : "Edit Profile"}
                  </button>
                </div>

                {editMode ? (
                  <div className="space-y-12 animate-in fade-in duration-500">
                    <section className="space-y-6">
                      <h3 className="text-xs uppercase tracking-widest opacity-40 font-bold">General Settings</h3>
                      <Input label="IMAGE URL" value={formData.imageUrl} onChange={(v) => setFormData({...formData, imageUrl: v})} />
                      <div className="grid grid-cols-3 gap-6">
                        <Input label="VISITORS" type="number" value={formData.visitors} onChange={(v) => setFormData({...formData, visitors: Math.max(0, parseInt(v) || 0)})} />
                        <Input label="PAYMENTS" type="number" value={formData.payments} onChange={(v) => setFormData({...formData, payments: Math.max(0, parseFloat(v) || 0)})} />
                        <Input label="CANCELLATIONS" type="number" value={formData.cancellations} onChange={(v) => setFormData({...formData, cancellations: Math.max(0, parseInt(v) || 0)})} />
                      </div>
                    </section>
                    
                    <section className="space-y-6">
                      <div className="flex justify-between items-center border-b pb-2">
                        <h3 className="text-xs uppercase tracking-widest opacity-40 font-bold">Show Management</h3>
                        <button onClick={addShow} className="text-[10px] bg-gray-100 dark:bg-gray-800 px-3 py-1 rounded-full">+ Add New Show</button>
                      </div>
                      
                      {formData.shows.map((show, index) => (
                        <ShowEditor 
                          key={index} 
                          show={show} 
                          onChange={(updatedShow) => {
                            const newShows = [...formData.shows];
                            newShows[index] = updatedShow;
                            setFormData({...formData, shows: newShows});
                          }}
                        />
                      ))}
                    </section>

                    <button onClick={saveData} className="w-full md:w-auto px-12 py-4 bg-green-600 text-white rounded-full font-bold shadow-lg shadow-green-900/20">
                      Save All Changes
                    </button>
                  </div>
                ) : (
                  <div className="space-y-10">
                    {formData.imageUrl && (
                      <img src={formData.imageUrl} alt="Museum" className="w-full h-64 object-cover rounded-3xl mb-8" />
                    )}
                    <div className="grid grid-cols-2 gap-12">
                      <InfoRow label="Museum Status" value="Verified Provider" />
                      <InfoRow label="Data Last Sync" value={new Date().toLocaleDateString()} />
                    </div>
                    
                    <div className="pt-8 border-t border-gray-100 dark:border-gray-900">
                      <h3 className="text-lg font-bold mb-6">Current Ticket Offerings</h3>
                      <div className="space-y-4">
                        {formData.shows.length > 0 ? formData.shows.map((s, i) => (
                          <div key={i} className="p-4 border rounded-2xl flex justify-between items-center">
                            <div>
                              <p className="font-bold">{s.name}</p>
                              <p className="text-xs opacity-50">{s.timings.join(" • ")}</p>
                            </div>
                            <div className="text-right">
                              <p className="text-sm font-semibold">₹{s.price.adult} (Adult)</p>
                              <p className="text-[10px] opacity-50">{s.duration_minutes} Minutes</p>
                            </div>
                          </div>
                        )) : <p className="opacity-40 italic">No shows configured.</p>}
                      </div>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

/* HELPER COMPONENTS */

const ShowEditor = ({ show, onChange }) => (
  <div className="p-8 border rounded-3xl mb-6 bg-gray-50/5 space-y-6">
    <div className="grid grid-cols-2 gap-6">
      <Input label="Show Name" value={show.name} onChange={(v) => onChange({...show, name: v})} />
      <Input 
        label="Duration (Mins)" 
        type="number" 
        value={show.duration_minutes} 
        onChange={(v) => onChange({...show, duration_minutes: Math.max(0, parseInt(v) || 0)})} 
      />
    </div>

    <div className="grid grid-cols-3 gap-6">
      <Input 
        label="Adult Price (₹)" 
        type="number" 
        value={show.price.adult} 
        onChange={(v) => onChange({...show, price: {...show.price, adult: Math.max(0, parseFloat(v) || 0)}})} 
      />
      <Input 
        label="Child Price (₹)" 
        type="number" 
        value={show.price.child} 
        onChange={(v) => onChange({...show, price: {...show.price, child: Math.max(0, parseFloat(v) || 0)}})} 
      />
      <Input 
        label="Senior Price (₹)" 
        type="number" 
        value={show.price.senior} 
        onChange={(v) => onChange({...show, price: {...show.price, senior: Math.max(0, parseFloat(v) || 0)}})} 
      />
    </div>

    <div className="grid grid-cols-2 gap-6">
      <Input 
        label="Timings (Comma separated)" 
        value={show.timings.join(", ")} 
        onChange={(v) => onChange({...show, timings: v.split(",").map(t => t.trim())})} 
      />
      <Input 
        label="Capacity" 
        type="number" 
        value={show.capacity_per_slot} 
        onChange={(v) => onChange({...show, capacity_per_slot: Math.max(0, parseInt(v) || 0)})} 
      />
    </div>
  </div>
);

const StatBox = ({ label, value, color = "" }) => (
  <div className="p-8 border rounded-[2rem] hover:shadow-xl hover:shadow-gray-500/5 transition-all">
    <p className="text-[10px] uppercase tracking-[0.2em] opacity-40 mb-3 font-bold">{label}</p>
    <h2 className={`text-4xl font-light tracking-tighter ${color}`}>{value}</h2>
  </div>
);

const InfoRow = ({ label, value }) => (
  <div className="flex flex-col">
    <span className="text-[10px] uppercase tracking-widest opacity-40 mb-2 font-bold">{label}</span>
    <span className="text-xl font-medium">{value || "—"}</span>
  </div>
);

const Input = ({ label, value, onChange, type = "text" }) => (
  <div className="flex flex-col w-full">
    <label className="text-[10px] uppercase opacity-50 mb-2 font-bold tracking-tight">{label}</label>
    <input
      type={type}
      min="0"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="bg-transparent border-b border-gray-200 dark:border-gray-800 py-2 outline-none focus:border-black dark:focus:border-white transition-colors text-lg"
    />
  </div>
);

export default MuseumDashboard;