export default function QuestionPreview({ q, index, onClick, onDelete }) {
  return (
    <div
      className="p-4 bg-gray-200 rounded-xl hover:bg-gray-300 transition"
      onClick={onClick}
    >
      <div className="flex justify-between items-start">
        <div className="cursor-pointer flex-1">
          <p className="text-lg font-semibold">
            {index + 1}. {q.text}
          </p>

          {/* IMAGE */}
          {q.image && (
            <img
              src={q.image}
              alt="question"
              className="mt-3 max-h-40 rounded-lg border"
            />
          )}

          {/* OPTIONS */}
          <div className="mt-3 space-y-2">
            {q.options?.map((opt, i) => {
              const isCorrect = q.correct?.includes(i);

              return (
                <div
                  key={i}
                  className={`flex items-center gap-2 p-2 rounded-lg ${
                    isCorrect
                      ? "bg-green-200 border border-green-500"
                      : "bg-white"
                  }`}
                >
                  {q.type !== "ordering" ? (
                    <span>{isCorrect ? "✔️" : "⭕"}</span>
                  ) : (
                    <span className="font-bold">{i + 1}.</span>
                  )}
                  <span>{opt}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* DELETE */}
        {onDelete && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete(index);
            }}
            className="text-red-600 hover:text-red-800 text-xl ml-3"
          >
            ✕
          </button>
        )}
      </div>
    </div>
  );
}
