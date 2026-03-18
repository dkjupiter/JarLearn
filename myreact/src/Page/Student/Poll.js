import { useState } from "react";
import Navbar from "../Navbar";

export default function PollPage() {
  const [selected, setSelected] = useState(null);

  const choices = [
    { id: 1, text: "Choice" },
    { id: 2, text: "Choice" },
    { id: 3, text: "Choice" },
    { id: 4, text: "Choice" },
    { id: 5, text: "Choice" },
  ];

  return (
    <div className="w-full min-h-screen bg-white flex flex-col py-6 pt-[80px]">
      <Navbar />

      {/* CONTENT SCROLLABLE */}
      <div className="flex-1 overflow-y-auto px-6">
        {/* POLL NAME */}
        <h1 className="text-3xl font-bold text-center mt-10 mb-10">
          Poll name
        </h1>

        {/* CHOICES */}
        <div className="flex flex-col gap-5 mb-20">
          {choices.map((item) => (
            <div
              key={item.id}
              onClick={() => setSelected(item.id)}
              className={`
                w-full
                rounded-xl
                py-4
                px-5
                text-xl
                font-medium
                flex
                items-center
                gap-4
                cursor-pointer
                transition
                ${
                  selected === item.id
                    ? "bg-gray-600 text-white"
                    : "bg-gray-300 text-black hover:bg-gray-400"
                }
              `}
            >
              
              <div
                className={`w-full flex items-center gap-4 ${
                  selected === item.id ? "text-white" : "text-black"
                }`}
              >
                <span className="text-2xl">{item.id}</span>
                <span>{item.text}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
