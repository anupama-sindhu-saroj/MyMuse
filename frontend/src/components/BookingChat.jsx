import { useState } from "react";

export default function BookingChat({ setShow, setPrice }) {

  const [messages, setMessages] = useState([]);

  const handleOption = (name, price) => {

    setShow(name);
    setPrice(price);

    setMessages([
      ...messages,
      { type: "user", text: `Add the ${name}.` },
      { type: "ai", text: "Requirement updated. Any further adjustment needed?" }
    ]);
  };

  return (
    <div className="space-y-20 pb-10">

      <div className="flex gap-8">

        <div className="w-12 h-12 bg-black dark:bg-white rounded-2xl flex items-center justify-center font-bold text-white dark:text-black text-sm">
          α
        </div>

        <div className="space-y-6">

          <p className="text-2xl serif italic">
            "I have initialized the sequence for your visit."
          </p>

          <div className="grid sm:grid-cols-2 gap-6">

            <button
              onClick={() => handleOption("Space Show (4D)", 1800)}
              className="p-10 rounded-[32px] bg-zinc-50 dark:bg-zinc-900 border"
            >
              <p className="text-xl font-bold">
                Space Show (4D)
              </p>
            </button>

            <button
              onClick={() => handleOption("Robotics Demo", 1500)}
              className="p-10 rounded-[32px] bg-zinc-50 dark:bg-zinc-900 border"
            >
              <p className="text-xl font-bold">
                Robotics Demo
              </p>
            </button>

          </div>

        </div>

      </div>

      {messages.map((msg, i) => (
        <div key={i} className={msg.type === "user" ? "flex justify-end" : "flex gap-8"}>
          <div className="bg-zinc-100 dark:bg-zinc-900 px-8 py-5 rounded-[30px]">
            {msg.text}
          </div>
        </div>
      ))}

    </div>
  );
}