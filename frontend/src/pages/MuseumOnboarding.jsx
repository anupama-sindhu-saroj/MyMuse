import React, { useState, useContext } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { ThemeContext } from "../context/ThemeContext";

// ✅ MOVE OUTSIDE (IMPORTANT FIX)
const PremiumInput = ({
  name,
  label,
  type = "text",
  placeholder,
  value,
  onChange,
  isDarkMode,
}) => (
  <div className="mb-8">
    <label className="text-xs uppercase tracking-widest opacity-50 mb-2 block">
      {label}
    </label>

    <input
      name={name}
      type={type}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      autoComplete="off"
      className={`w-full px-5 py-4 rounded-xl text-sm border transition-all duration-300 outline-none
      ${
        isDarkMode
          ? "bg-neutral-900 border-neutral-700 text-white focus:border-white"
          : "bg-white border-gray-200 text-black focus:border-black"
      }`}
    />
  </div>
);

const MuseumOnboarding = () => {
  const [step, setStep] = useState(1);
  const navigate = useNavigate();
  const { isDarkMode } = useContext(ThemeContext);

  const [formData, setFormData] = useState({
    license: "",
    accountHolder: "",
    routingNumber: "",
    accountNumber: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const nextStep = () => setStep(2);
  const prevStep = () => setStep(1);

  const handleSubmit = async () => {
    try {
      const token = localStorage.getItem("museumToken");

      await axios.put(
        `${import.meta.env.VITE_API_URL}/api/museums/onboarding`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      alert("Infrastructure Verified ✅");
      navigate("/museum-dashboard");
    } catch (err) {
      console.log(err);
      alert("Error saving data");
    }
  };

  return (
    <div
      className={`min-h-screen flex flex-col ${
        isDarkMode ? "bg-black text-white" : "bg-white text-black"
      }`}
    >
      {/* NAV */}
      <nav className="p-8 flex justify-between items-center border-b">
        <div className="font-bold text-2xl uppercase">Museo.</div>
        <div className="text-xs tracking-widest opacity-50">
          STEP {step}/2
        </div>
      </nav>

      <div className="flex-1 grid grid-cols-1 lg:grid-cols-2">
        
        {/* LEFT SIDE */}
        <div className="p-12 flex flex-col justify-center bg-[#FAFAFA] dark:bg-[#111]">
          <h1 className="text-6xl font-serif italic mb-6">
            {step === 1 ? "Identity." : "Payouts."}
          </h1>

          <p className="opacity-50 max-w-sm">
            {step === 1
              ? "Provide your institutional license for verification."
              : "Add your banking details to receive ticket payments."}
          </p>
        </div>

        {/* RIGHT SIDE */}
        <div className="p-12 flex items-center justify-center">
          <div className="w-full max-w-md">

            {/* STEP 1 */}
            {step === 1 && (
              <PremiumInput
                name="license"
                label="Institution License ID"
                placeholder="LIC-2026-X99"
                value={formData.license}
                onChange={handleChange}
                isDarkMode={isDarkMode}
              />
            )}

            {/* STEP 2 */}
            {step === 2 && (
              <>
                <PremiumInput
                  name="accountHolder"
                  label="Account Holder"
                  placeholder="Museum Trust"
                  value={formData.accountHolder}
                  onChange={handleChange}
                  isDarkMode={isDarkMode}
                />

                <PremiumInput
                  name="routingNumber"
                  label="IFSC / Routing"
                  placeholder="SBIN0001234"
                  value={formData.routingNumber}
                  onChange={handleChange}
                  isDarkMode={isDarkMode}
                />

                <PremiumInput
                  name="accountNumber"
                  type="password"
                  label="Account Number"
                  placeholder="••••••••"
                  value={formData.accountNumber}
                  onChange={handleChange}
                  isDarkMode={isDarkMode}
                />
              </>
            )}

            {/* BUTTONS */}
            <div className="flex gap-4 mt-10">
              {step === 2 && (
                <button
                  onClick={prevStep}
                  className="text-sm opacity-50 hover:opacity-100 transition"
                >
                  Back
                </button>
              )}

              <button
                onClick={step === 2 ? handleSubmit : nextStep}
                className="ml-auto px-8 py-3 bg-black text-white rounded-full text-xs tracking-widest hover:scale-105 transition"
              >
                {step === 2 ? "Finish" : "Continue"}
              </button>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};

export default MuseumOnboarding;