import React, { useState } from "react";
import Navbar from "../components/Navbar";
import BookingSummary from "../components/BookingSummary";
import PaymentMethods from "../components/PaymentMethods";
import PayButton from "../components/PayButton";

const PaymentPage = () => {

  const [selectedMethod, setSelectedMethod] = useState("upi");
  const [isProcessing, setIsProcessing] = useState(false);

  const handlePayment = () => {
  setIsProcessing(true);

  setTimeout(() => {
    window.location.href = "/ticket";
  }, 2000);
};

  return (
    <>
      <Navbar />

      <div className="min-h-screen bg-white dark:bg-neutral-900 text-black dark:text-white pt-32 pb-20 px-6 md:px-20 transition-colors duration-500">

        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-16">

          {/* LEFT */}
          <div className="lg:col-span-7">

            {/* SERIF HEADLINE */}
            <h1 className="font-serif text-6xl md:text-7xl leading-tight mb-12">
              Finalize <br />
              <span className="text-neutral-400 dark:text-neutral-500">
                Booking.
              </span>
            </h1>

            {/* LABEL */}
            <p className="font-sans text-xs uppercase tracking-[0.35em] text-neutral-400 mb-6">
              Select Method
            </p>

            <PaymentMethods
              selected={selectedMethod}
              onSelect={setSelectedMethod}
            />

            <div className="mt-10">
              <PayButton
                onClick={handlePayment}
                isLoading={isProcessing}
                amount="₹400.00"
              />
            </div>

          </div>

          {/* RIGHT SIDE */}
            <div className="lg:col-span-5 space-y-8">

            {/* ARTWORK CARD */}
            <div className="relative rounded-2xl overflow-hidden shadow-xl">

                <img
                src="/src/assets/color.png"
                alt="Artwork"
                className="w-full h-[350px] object-cover"
                />

                <div className="absolute bottom-4 left-4 right-4 bg-white/30 backdrop-blur-md p-4 rounded-xl text-white">
                <p className="text-xs uppercase tracking-widest">
                    CURATION ALPHA
                </p>

                <p className="font-serif text-xl italic">
                    The Modern Wing
                </p>
                </div>

            </div>

            {/* SUMMARY */}
            <div className="sticky top-32">
                <BookingSummary />
            </div>

            </div>

        </div>

      </div>
    </>
  );
};

export default PaymentPage;