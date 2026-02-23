function Ranking({ question, results, onNext }) {
  // results = [{ name, score, time }]

  const top5 = results.slice(0, 5);

  return (
    <div className="w-full min-h-screen bg-white flex flex-col items-center py-6">

      <h2 className="text-2xl font-bold mb-1">Top 5</h2>
      <p className="text-gray-600 mb-6 text-center">
        {question.Question_Text}
      </p>

      <div className="w-11/12 space-y-3 mb-10">
        {top5.map((r, index) => (
          <div
            key={r.name}
            className={`w-full py-4 px-5 rounded-xl flex justify-between items-center
              ${index === 0 ? "bg-yellow-300" :
                index === 1 ? "bg-gray-300" :
                index === 2 ? "bg-orange-300" :
                "bg-gray-100"}
            `}
          >
            <div className="flex items-center gap-4">
              <span className="text-xl font-bold">
                {r.rank}
              </span>
              <span className="font-medium">
                {r.name}
              </span>
            </div>

            <div className="text-right">
              <div className="font-bold">
                {r.score} pts
              </div>
              <div className="text-sm text-gray-600">
                {r.time}s
              </div>
            </div>
          </div>
        ))}
      </div>

      <button
        onClick={onNext}
        className="w-72 py-4 bg-gray-600 text-white rounded-xl text-lg hover:bg-gray-500"
      >
        Next Question
      </button>
    </div>
  );
}

export default Ranking;