import { useState } from "react";
import ExploreNavbar from "../components/ExploreNavbar";
import ExploreHeader from "../components/ExploreHeader";
import AISidebar from "../components/AISidebar";
import MuseumGrid from "../components/MuseumGrid";
import MuseumModal from "../components/MuseumModal";
import "../styles/explore.css";

export default function Explore() {
  const [modal, setModal] = useState({ open: false, title: "", desc: "" });

  // Shared state — search query flows from Header → Grid + Sidebar
  const [searchQuery, setSearchQuery] = useState("");
  const [userLocation, setUserLocation] = useState(null);

  // When header searches → update cards AND send to chatbot
  const [sidebarMessage, setSidebarMessage] = useState(null);

  function handleSearch(query) {
    setSearchQuery(query);
  }

  function openDetails(title, desc) {
    setModal({ open: true, title, desc });
    document.body.style.overflow = "hidden";
  }

  function closeDetails() {
    setModal({ open: false, title: "", desc: "" });
    document.body.style.overflow = "auto";
  }

  return (
    <div className="bg-white text-black dark:bg-[#0a0a0a] dark:text-white min-h-screen">

      <MuseumModal modal={modal} closeDetails={closeDetails} />

      <ExploreNavbar />

      <ExploreHeader onSearch={handleSearch} />

      <main className="max-w-[1400px] mx-auto px-6 md:px-12 py-12 grid grid-cols-12 gap-12 lg:gap-20">

        <AISidebar
          externalMessage={sidebarMessage}
          onLocationDetected={setUserLocation}
        />

        <MuseumGrid
          openDetails={openDetails}
          searchQuery={searchQuery}
          userLocation={userLocation}
        />

      </main>

    </div>
  );
}