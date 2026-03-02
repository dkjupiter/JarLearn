// import React from "react";

// export default function PollResultPage({ poll, onBack }) {
//   const results = [
//     { id: 1, text: "Choice", percent: 5 },
//     { id: 2, text: "Choice", percent: 35 },
//     { id: 3, text: "Choice", percent: 25 },
//     { id: 4, text: "Choice", percent: 15 },
//     { id: 5, text: "Choice", percent: 20 },
//   ];

//   return (
//     <div className="max-w-md mx-auto h-full flex flex-col">
//       {/* 🔹 Center content */}
//       <div className="flex-1 flex items-center justify-center px-4">
//         <div className="w-full space-y-6">
//           <h2 className="text-2xl font-bold text-center">
//             {poll?.name}
//           </h2>

//           <div className="space-y-4">
//             {results.map((r) => (
//               <div
//                 key={r.id}
//                 className="relative bg-gray-300 rounded-2xl h-14 overflow-hidden"
//               >
//                 <div
//                   className="absolute left-0 top-0 h-full bg-gray-500 rounded-2xl"
//                   style={{ width: `${r.percent}%` }}
//                 />

//                 <div className="relative z-10 flex items-center justify-between h-full px-4">
//                   <div className="flex items-center gap-4">
//                     <span className="font-medium">{r.id}</span>
//                     <span>{r.text}</span>
//                   </div>
//                   <span className="font-medium">{r.percent}%</span>
//                 </div>
//               </div>
//             ))}
//           </div>
//         </div>
//       </div>

//       {/* 🔙 Back button */}
//       <div className="p-4">
//         <button
//           onClick={onBack}
//           className="w-full border border-gray-400 rounded-xl py-3 text-lg"
//         >
//           Back
//         </button>
//       </div>
//     </div>
//   );
// }

import React from "react";

export default function PollResultPage({ poll }) {
  const results = [
    { id: 1, text: "Choice", percent: 5 },
    { id: 2, text: "Choice", percent: 35 },
    { id: 3, text: "Choice", percent: 25 },
    { id: 4, text: "Choice", percent: 15 },
    { id: 5, text: "Choice", percent: 20 },
  ];

  return (
    <div className="max-w-md mx-auto h-full flex items-center justify-center px-4">
      <div className="w-full space-y-6">
        <h2 className="text-2xl font-bold text-center">
          {poll?.name}
        </h2>

        <div className="space-y-4">
          {results.map((r) => (
            <div key={r.id} className="relative bg-slate-800 rounded-xl h-12 overflow-hidden">
              <div
                className="absolute left-0 top-0 h-full bg-cyan-400/70"
                style={{ width: `${r.percent}%` }}
              />
              <div className="relative z-10 flex justify-between items-center h-full px-4 text-slate-100">
                <span>{r.text}</span>
                <span>{r.percent}%</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
