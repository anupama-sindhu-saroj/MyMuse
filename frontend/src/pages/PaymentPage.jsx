import React, { useState, useEffect } from "react";
import Navbar from "../components/Navbar";
import BookingSummary from "../components/BookingSummary";
import PaymentMethods from "../components/PaymentMethods";
import PayButton from "../components/PayButton";
import AIChatBubble from "../components/AIChatBubble";
import AIVerification from "../components/AIVerification";
import AIStatusBar from "../components/AIStatusBar";
import AIPaymentRecovery from "../components/AIPaymentRecovery";

const PaymentPage = () => {
  const [selectedMethod, setSelectedMethod] = useState("upi");
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentFailed, setPaymentFailed] = useState(false);
  const [bookingData, setBookingData] = useState(null); // ✅ store booking info

  useEffect(() => {
  const bookingId = localStorage.getItem("pending_booking_id")
  if (!bookingId) return;

  fetch(`http://localhost:8000/api/payment/summary?booking_id=${bookingId}`, {
    headers: { "Authorization": `Bearer ${localStorage.getItem("token")}` }
  })
    .then(res => res.ok ? res.json() : Promise.reject(res.status))
    .then(data => setBookingData(data))
    .catch(() => {
      const cached = localStorage.getItem("last_booking");
      if (cached) setBookingData(JSON.parse(cached));
    });
}, []);

  const handlePayment = async () => {
    setIsProcessing(true);

    try {
      const orderRes = await fetch("http://localhost:8000/api/payment/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${localStorage.getItem("token")}`
        },
        body: JSON.stringify({
          booking_id: localStorage.getItem("pending_booking_id")
        })
      });

      // ✅ Check for server errors before parsing
      if (!orderRes.ok) {
        const err = await orderRes.json().catch(() => ({}));
        console.error("Order creation failed:", err);
        setPaymentFailed(true);
        setIsProcessing(false);
        return;
      }

      const orderData = await orderRes.json();
      setBookingData(orderData); // ✅ update summary with latest data
      console.log("Razorpay Key:", import.meta.env.VITE_RAZORPAY_KEY_ID);
      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID,
        amount: orderData.amount,
        currency: "INR",
        order_id: orderData.order_id,
        name: "Museo",
        description: "Museum Ticket Booking",
        theme: { color: "#000000" },

        handler: async (response) => {
          const verifyRes = await fetch("http://localhost:8000/api/payment/verify", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "Authorization": `Bearer ${localStorage.getItem("token")}`
            },
            body: JSON.stringify({
              booking_id: orderData.booking_id,
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature
            })
          });

          const verifyData = await verifyRes.json();

          if (verifyData.success) {
            // Save full booking data so TicketPage can read it
            localStorage.setItem("last_booking", JSON.stringify({
                show_name: verifyData.show_name,
                museum_name: verifyData.museum_name,
                visit_date: verifyData.visit_date,
                time_slot: verifyData.time_slot,
                tickets: verifyData.tickets,
                total_amount: verifyData.total_amount
            }));

            window.location.href = `/ticket?booking_id=${verifyData.ticket_id}&qr=${verifyData.ticket_id}`;
        } else {
            setPaymentFailed(true);
            setIsProcessing(false);
          }
        },

        modal: {
          ondismiss: () => {
            setPaymentFailed(true);
            setIsProcessing(false);
          }
        }
      };

      const rzp = new window.Razorpay(options);

      rzp.on("payment.failed", function () {
        setPaymentFailed(true);
        setIsProcessing(false);
      });

      rzp.open();

    } catch (err) {
      console.error("Payment error:", err);
      setPaymentFailed(true);
      setIsProcessing(false);
    }
  };

  // ✅ Format amount from paise → rupees for display
  const displayAmount = bookingData?.amount
    ? `₹${(bookingData.amount / 100).toFixed(2)}`
    : "₹0.00";

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-white dark:bg-neutral-900 text-black dark:text-white pt-32 pb-20 px-6 md:px-20 transition-colors duration-500">
        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-16">
          <div className="lg:col-span-7">
            <h1 className="font-serif text-6xl md:text-7xl leading-tight mb-12">
              Finalize <br />
              <span className="text-neutral-400 dark:text-neutral-500">Booking.</span>
            </h1>

            <AIChatBubble
              selectedMethod={selectedMethod}
              onMethodRecommended={(method) => setSelectedMethod(method)}
            />

            <p className="font-sans text-xs uppercase tracking-[0.35em] text-neutral-400 mb-6">
              Select Method
            </p>

            <PaymentMethods
              selected={selectedMethod}
              onSelect={setSelectedMethod}
            />
            <AIVerification active={isProcessing} />
            <div className="mt-10">
              <PayButton
                onClick={handlePayment}
                isLoading={isProcessing}
                amount={displayAmount} // ✅ real amount from API
              />
            </div>
            <AIStatusBar active={isProcessing} />

            <AIPaymentRecovery
              visible={paymentFailed}
              failedMethod={selectedMethod}
              onSwitchMethod={(method) => {
                setSelectedMethod(method);
                setPaymentFailed(false);
              }}
            />
          </div>

          <div className="lg:col-span-5 space-y-8">
            <div className="relative rounded-2xl overflow-hidden shadow-xl">
              <img
                src="/src/assets/color.png"
                alt="Artwork"
                className="w-full h-[350px] object-cover"
              />
              <div className="absolute bottom-4 left-4 right-4 bg-white/30 backdrop-blur-md p-4 rounded-xl text-white">
                <p className="text-xs uppercase tracking-widest">CURATION ALPHA</p>
                <p className="font-serif text-xl italic">The Modern Wing</p>
              </div>
            </div>
            <div className="sticky top-32">
              {/* ✅ Pass bookingData as props to BookingSummary */}
              <BookingSummary bookingData={bookingData} />
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default PaymentPage;