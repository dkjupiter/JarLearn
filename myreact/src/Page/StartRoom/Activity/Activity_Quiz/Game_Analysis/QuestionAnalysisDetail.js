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

  return (
    <>
      {/* Difficulty */}
      <div className="mb-4">
        {difficulty === "easy" && (
          <span className="px-3 py-1 rounded-full bg-green-100 text-green-700">
            ข้อง่าย (ถูก {correctPercent}%)
          </span>
        )}
        {difficulty === "medium" && (
          <span className="px-3 py-1 rounded-full bg-yellow-100 text-yellow-700">
            ข้อปานกลาง (ถูก {correctPercent}%)
          </span>
        )}
        {difficulty === "hard" && (
          <span className="px-3 py-1 rounded-full bg-red-100 text-red-700">
            ข้อยาก (ถูกแค่ {correctPercent}%)
          </span>
        )}
      </div>

      {/* Bars */}
      {analysis.map((row) => {
        const percent = toNumber(row.percent) ?? 0;

        return (
          <div key={row.Option_ID} className="mb-3">
            <div className="flex justify-between mb-1">
              <span>
                {row.Option_Text}
                {row.is_correct}
              </span>
              <span className="text-sm text-gray-600">
                {percent}%
              </span>
            </div>

            <div className="w-full h-3 bg-gray-200 rounded">
              <div
                className={`h-full ${
                  row.is_correct
                    ? "bg-green-500"
                    : "bg-red-400"
                }`}
                style={{ width: `${percent}%` }}
              />
            </div>
          </div>
        );
      })}
    </>
  );
} export default QuestionAnalysisDetail;