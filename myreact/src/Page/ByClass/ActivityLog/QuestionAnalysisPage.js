// import React from "react";

// export default function QuestionAnalysisPage({ questionId, onBack }) {
//   const question = {
//     text: `Question ${questionId}`,
//     avgTime: 12,
//     choices: [
//       { text: "Choice A", percent: 20 },
//       { text: "Choice B", percent: 45 },
//       { text: "Choice C", percent: 25 },
//       { text: "Choice D", percent: 10 },
//     ],
//   };

//   return (
//     <div className="max-w-md mx-auto space-y-4">
//       <h2 className="text-xl font-bold text-center">วิเคราะห์เกม</h2>

//       <div className="bg-gray-200 rounded-xl p-4">
//         <div className="font-medium mb-3">{question.text}</div>

//         {question.choices.map((c, i) => (
//           <div key={i} className="mb-3">
//             <div className="flex justify-between text-sm">
//               <span>{c.text}</span>
//               <span>{c.percent}%</span>
//             </div>
//             <div className="h-3 bg-gray-300 rounded-full">
//               <div
//                 className="h-3 bg-gray-600 rounded-full"
//                 style={{ width: `${c.percent}%` }}
//               />
//             </div>
//           </div>
//         ))}

//         <div className="text-sm mt-2">
//           time avg : {question.avgTime} sec
//         </div>
//       </div>
//     </div>
//   );
// }

// import React, { useEffect, useRef } from "react";

// export default function QuestionAnalysisPage({ focusedQuestionId }) {
//   const questions = [
//     {
//       id: 1,
//       text: "Question 1",
//       avgTime: 12,
//       choices: [
//         { text: "Choice A", percent: 20 },
//         { text: "Choice B", percent: 45 },
//         { text: "Choice C", percent: 25 },
//         { text: "Choice D", percent: 10 },
//       ],
//     },
//     {
//       id: 2,
//       text: "Question 2",
//       avgTime: 10,
//       choices: [
//         { text: "Choice A", percent: 30 },
//         { text: "Choice B", percent: 40 },
//         { text: "Choice C", percent: 20 },
//         { text: "Choice D", percent: 10 },
//       ],
//     },
//     {
//       id: 3,
//       text: "Question 3",
//       avgTime: 8,
//       choices: [
//         { text: "Choice A", percent: 10 },
//         { text: "Choice B", percent: 20 },
//         { text: "Choice C", percent: 50 },
//         { text: "Choice D", percent: 20 },
//       ],
//     },
//   ];

//   // เก็บ ref ของแต่ละข้อ
//   const refs = useRef({});

//   // 🔥 scroll ไปยังข้อที่ focus
//   useEffect(() => {
//     if (focusedQuestionId && refs.current[focusedQuestionId]) {
//       refs.current[focusedQuestionId].scrollIntoView({
//         behavior: "smooth",
//         block: "center",
//       });
//     }
//   }, [focusedQuestionId]);

//   return (
//     <div className="max-w-md mx-auto space-y-6">
//       <h2 className="text-xl font-bold text-center">
//         วิเคราะห์เกม (ทุกข้อ)
//       </h2>

//       {questions.map((q) => {
//         const isFocused = q.id === focusedQuestionId;

//         return (
//           <div
//             key={q.id}
//             ref={(el) => (refs.current[q.id] = el)}
//             className={`rounded-xl p-4 transition
//               ${isFocused
//                 ? "bg-gray-200 ring-2 ring-gray-600"
//                 : "bg-gray-100"}
//             `}
//           >
//             <div className="font-medium mb-3">
//               {q.text}
//               {isFocused && (
//                 <span className="ml-2 text-xs text-gray-600">
//                   (focus)
//                 </span>
//               )}
//             </div>

//             {q.choices.map((c, i) => (
//               <div key={i} className="mb-2">
//                 <div className="flex justify-between text-sm">
//                   <span>{c.text}</span>
//                   <span>{c.percent}%</span>
//                 </div>
//                 <div className="h-3 bg-gray-300 rounded-full">
//                   <div
//                     className="h-3 bg-gray-600 rounded-full"
//                     style={{ width: `${c.percent}%` }}
//                   />
//                 </div>
//               </div>
//             ))}

//             <div className="text-sm mt-2">
//               time avg : {q.avgTime} sec
//             </div>
//           </div>
//         );
//       })}
//     </div>
//   );
// }

import React, { useEffect, useRef, useState } from "react";

export default function QuestionAnalysisPage({ focusedQuestionId }) {
  const questions = [
    {
      id: 1,
      text: "Question 1",
      avgTime: 12,
      choices: [
        { text: "Choice A", percent: 20 },
        { text: "Choice B", percent: 45 },
        { text: "Choice C", percent: 25 },
        { text: "Choice D", percent: 10 },
      ],
    },
    {
      id: 2,
      text: "Question 2",
      avgTime: 10,
      choices: [
        { text: "Choice A", percent: 30 },
        { text: "Choice B", percent: 40 },
        { text: "Choice C", percent: 20 },
        { text: "Choice D", percent: 10 },
      ],
    },
    {
      id: 3,
      text: "Question 3",
      avgTime: 8,
      choices: [
        { text: "Choice A", percent: 10 },
        { text: "Choice B", percent: 20 },
        { text: "Choice C", percent: 50 },
        { text: "Choice D", percent: 20 },
      ],
    },
  ];

  const refs = useRef({});
  const [activeQuestionId, setActiveQuestionId] = useState(focusedQuestionId);

  // 🔹 scroll ไปข้อที่เลือกมาจาก Report
  useEffect(() => {
    if (focusedQuestionId && refs.current[focusedQuestionId]) {
      refs.current[focusedQuestionId].scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
      setActiveQuestionId(focusedQuestionId);
    }
  }, [focusedQuestionId]);

  // 🔥 focus ตาม "กลางหน้าจอ"
  useEffect(() => {
    const handleScroll = () => {
      const viewportCenter = window.innerHeight / 2;

      let closest = null;
      let minDistance = Infinity;

      Object.entries(refs.current).forEach(([id, el]) => {
        if (!el) return;

        const rect = el.getBoundingClientRect();
        const elementCenter = rect.top + rect.height / 2;

        const distance = Math.abs(viewportCenter - elementCenter);

        if (distance < minDistance) {
          minDistance = distance;
          closest = Number(id);
        }
      });

      if (closest !== null) {
        setActiveQuestionId(closest);
      }
    };

    handleScroll(); // run ครั้งแรก
    window.addEventListener("scroll", handleScroll, { passive: true });

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  return (
    <div className="max-w-md mx-auto space-y-6">
      <h2 className="text-xl font-bold text-center">
        วิเคราะห์เกม (focus = กลางจอ)
      </h2>

      {questions.map((q) => {
        const isFocused = q.id === activeQuestionId;

        return (
          <div
            key={q.id}
            ref={(el) => (refs.current[q.id] = el)}
            className={`rounded-xl p-4 transition-all
              ${isFocused
                ? "bg-gray-200 ring-2 ring-gray-700 scale-[1.02]"
                : "bg-gray-100"}
            `}
          >
            <div className="font-medium mb-3">
              {q.text}
              {isFocused && (
                <span className="ml-2 text-xs text-gray-600">
                  (focused)
                </span>
              )}
            </div>

            {q.choices.map((c, i) => (
              <div key={i} className="mb-2">
                <div className="flex justify-between text-sm">
                  <span>{c.text}</span>
                  <span>{c.percent}%</span>
                </div>
                <div className="h-3 bg-gray-300 rounded-full">
                  <div
                    className="h-3 bg-gray-600 rounded-full"
                    style={{ width: `${c.percent}%` }}
                  />
                </div>
              </div>
            ))}

            <div className="text-sm mt-2">
              time avg : {q.avgTime} sec
            </div>
          </div>
        );
      })}
    </div>
  );
}
