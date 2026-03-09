function QuestionAnalysisDetail({ analysis = [] }) {

  const toNumber = (v) => {
    const n = Number(v);
    return Number.isFinite(n) ? n : null;
  };

  const correct = analysis.find((r) => r.is_correct);
  const correctPercent = toNumber(correct?.percent) ?? 0;

  const difficulty =
    correctPercent >= 80
      ? "easy"
      : correctPercent >= 50
      ? "medium"
      : "hard";

  const difficultyColor = {
    easy: "bg-emerald-500/20 text-emerald-400",
    medium: "bg-yellow-500/20 text-yellow-400",
    hard: "bg-rose-500/20 text-rose-400"
  };

  const difficultyText = {
    easy: "Easy",
    medium: "Medium",
    hard: "Hard"
  };

  return (

    <div className="space-y-4">

      {/* Difficulty */}

      <div className="flex justify-between items-center">

        <span
          className={`px-3 py-1 text-xs rounded-full font-semibold ${difficultyColor[difficulty]}`}
        >
          {difficultyText[difficulty]}
        </span>

        <span className="text-sm text-slate-400">
          {correctPercent}% correct
        </span>

      </div>


      {/* Bars */}

      <div className="space-y-3">

        {analysis.map((row) => {

          const percent = toNumber(row.percent);

          return (

            <div
              key={row.Option_ID}
              className="relative w-full h-8 bg-slate-700 rounded-lg overflow-hidden"
            >

              {/* Bar */}

              <div
                className={`h-full ${
                  row.is_correct
                    ? "bg-emerald-500"
                    : "bg-red-500"
                } transition-all duration-500`}
                style={{ width: `${percent}%` }}
              />


              {/* Label inside bar */}

              <div className="absolute inset-0 flex items-center justify-between px-3 text-xs font-medium">

                <span className="flex items-center gap-2">

                  {row.Option_Text}

                </span>

                <span className="text-slate-200">
                  {percent}%
                </span>

              </div>

            </div>

          );

        })}

      </div>

    </div>

  );
} export default QuestionAnalysisDetail;