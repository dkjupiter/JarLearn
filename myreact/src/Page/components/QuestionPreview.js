// export default function QuestionPreview({ q, index, onClick, onDelete }) {
//   return (
//     <div
//       className="p-4 bg-gray-200 rounded-xl hover:bg-gray-300 transition"
//       onClick={onClick}
//     >
//       <div className="flex justify-between items-start">
//         <div className="cursor-pointer flex-1">
//           <p className="text-lg font-semibold">
//             {index + 1}. {q.text}
//           </p>

//           {/* IMAGE */}
//           {q.image && (
//             <img
//               src={q.image}
//               alt="question"
//               className="mt-3 max-h-40 rounded-lg border"
//             />
//           )}

//           {/* OPTIONS */}
//           <div className="mt-3 space-y-2">
//             {q.options?.map((opt, i) => {
//               const isCorrect = q.correct?.includes(i);

//               return (
//                 <div
//                   key={i}
//                   className={`flex items-center gap-2 p-2 rounded-lg ${
//                     isCorrect
//                       ? "bg-green-200 border border-green-500"
//                       : "bg-white"
//                   }`}
//                 >
//                   {q.type !== "ordering" ? (
//                     <span>{isCorrect ? "✔️" : "⭕"}</span>
//                   ) : (
//                     <span className="font-bold">{i + 1}.</span>
//                   )}
//                   <span>{opt}</span>
//                 </div>
//               );
//             })}
//           </div>
//         </div>

//         {/* DELETE */}
//         {onDelete && (
//           <button
//             onClick={(e) => {
//               e.stopPropagation();
//               onDelete(index);
//             }}
//             className="text-red-600 hover:text-red-800 text-xl ml-3"
//           >
//             ✕
//           </button>
//         )}
//       </div>
//     </div>
//   );
// }

export default function QuestionPreview({ q, index, onClick, onDelete }) {
  return (
    <div
      onClick={onClick}
      className="
        p-5
        bg-slate-800
        border border-slate-700
        rounded-xl
        hover:border-cyan-400/50
        hover:shadow-lg hover:shadow-cyan-400/10
        transition
        cursor-pointer
      "
    >
      <div className="flex justify-between items-start gap-4">

        {/* LEFT CONTENT */}
        <div className="flex-1">

          {/* QUESTION TITLE */}
          <p className="text-lg font-semibold text-slate-100 mb-3">
            {index + 1}. {q.text}
          </p>

          {/* IMAGE */}
          {q.image && (
            <img
              src={q.image}
              alt="question"
              className="
                mt-2
                max-h-44
                rounded-lg
                border border-slate-600
              "
            />
          )}

          {/* OPTIONS */}
          <div className="mt-4 space-y-2">
            {q.options?.map((opt, i) => {
              const isCorrect = q.correct?.includes(i);

              return (
                <div
                  key={i}
                  className={`
                    flex items-center gap-3
                    px-3 py-2
                    rounded-lg
                    text-sm
                    ${
                      isCorrect
                        ? "bg-cyan-400/20 border border-cyan-400 text-cyan-300"
                        : "bg-slate-700 text-slate-300"
                    }
                  `}
                >
                  {q.type !== "ordering" ? (
                    <span className="text-xs">
                      {isCorrect ? "O" : "X"}
                    </span>
                  ) : (
                    <span className="font-semibold text-slate-400">
                      {i + 1}.
                    </span>
                  )}

                  <span className="truncate">{opt}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* DELETE BUTTON */}
        {onDelete && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete(index);
            }}
            className="
              text-slate-500
              hover:text-red-400
              text-xl
              transition
            "
          >
            ✕
          </button>
        )}
      </div>
    </div>
  );
}