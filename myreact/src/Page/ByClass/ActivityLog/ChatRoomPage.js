// import React from "react";

// export default function ChatRoomPage({ room, onBack }) {
//   const messages = [
//     {
//       id: 1,
//       text: "สวัสดีวันจันทร์",
//       time: "8:00 AM",
//     },
//     {
//       id: 2,
//       text: "ยากเกินทน นศจะไม่ทน",
//       time: "8:00 AM",
//     },
//   ];

//   return (
//     <div className="max-w-md mx-auto flex flex-col h-full px-4 py-6">
//       {/* Header */}
//       <div className="bg-gray-300 rounded-3xl py-6 text-center mb-6">
//         <div className="text-2xl font-bold">{room?.name}</div>
//         <div className="text-xl font-bold">{room?.className}</div>
//       </div>

//       {/* Messages */}
//       <div className="flex-1 space-y-4">
//         <div className="text-center text-gray-500 text-sm">
//           8:00 AM
//         </div>

//         {messages.map((m) => (
//           <div
//             key={m.id}
//             className="bg-gray-200 rounded-2xl p-4 text-lg"
//           >
//             {m.text}
//           </div>
//         ))}
//       </div>

//       {/* Back button */}
//       <button
//         onClick={onBack}
//         className="mt-6 border border-gray-400 rounded-xl py-3 text-lg"
//       >
//         Back
//       </button>
//     </div>
//   );
// }


import React from "react";

export default function ChatRoomPage({ room }) {
  const messages = [
    {
      id: 1,
      text: "สวัสดีวันจันทร์",
      time: "8:00 AM",
    },
    {
      id: 2,
      text: "ยากเกินทน นศจะไม่ทน",
      time: "8:00 AM",
    },
  ];

  return (
    <div className="max-w-md mx-auto flex flex-col h-full px-4 py-6">
      {/* Header */}
      <div className="bg-gray-300 rounded-3xl py-6 text-center mb-6">
        <div className="text-2xl font-bold">{room?.name}</div>
        <div className="text-xl font-bold">{room?.className}</div>
      </div>

      {/* Messages */}
      <div className="flex-1 space-y-4">
        <div className="text-center text-gray-500 text-sm">
          8:00 AM
        </div>

        {messages.map((m) => (
          <div
            key={m.id}
            className="bg-gray-200 rounded-2xl p-4 text-lg"
          >
            {m.text}
          </div>
        ))}
      </div>
    </div>
  );
}
