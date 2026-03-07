import { useState } from "react";
import ExploreNavbar from "../components/ExploreNavbar";
import ExploreHeader from "../components/ExploreHeader";
import AISidebar from "../components/AISidebar";
import MuseumGrid from "../components/MuseumGrid";
import MuseumModal from "../components/MuseumModal";
import "../styles/explore.css";

export default function Explore() {

  const [modal, setModal] = useState({
    open: false,
    title: "",
    desc: ""
  });

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

      <ExploreHeader />

      <main className="max-w-[1400px] mx-auto px-6 md:px-12 py-12 grid grid-cols-12 gap-12 lg:gap-20">

        <AISidebar />

        <MuseumGrid openDetails={openDetails} />

      </main>

    </div>
  );
}