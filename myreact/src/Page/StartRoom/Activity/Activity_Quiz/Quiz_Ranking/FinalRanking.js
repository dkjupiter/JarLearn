import { useEffect, useState } from "react";

function FinalRankingWithAnimation({ results = [], onFinish,activitySessionId }) {
  const [visibleCount, setVisibleCount] = useState(0);

  // โผล่ทีละอันดับ
  useEffect(() => {
    if (visibleCount >= results.length) return;

    const timer = setTimeout(() => {
      setVisibleCount((v) => v + 1);
    }, 800); // 👈 ความเร็วลุ้น

    return () => clearTimeout(timer);
  }, [visibleCount, results.length]);

  return (
    <div className="w-full min-h-screen bg-white flex flex-col items-center pt-10">

      <h1 className="text-3xl font-bold mb-2">🏆 Final Ranking</h1>
      <p className="text-gray-500 mb-8">
        คะแนนรวมทั้งเกม
      </p>

      <div className="w-11/12 max-w-xl space-y-4">
        {results.slice(0, visibleCount).map((r, index) => {
          const rank = index + 1;

          const bg =
            rank === 1
              ? "bg-yellow-300"
              : rank === 2
              ? "bg-gray-300"
              : rank === 3
              ? "bg-orange-300"
              : "bg-gray-100";

          return (
            <div
              key={r.Student_ID}
              className={`flex justify-between items-center px-6 py-4 rounded-xl shadow transition-all duration-500
                animate-slide-up ${bg}
              `}
            >
              {/* ซ้าย */}
              <div className="flex items-center gap-4">
                <div className="text-2xl font-bold">
                  #{rank}
                </div>
                <div className="font-medium text-lg">
                  {r.name || `Student ${r.Student_ID}`}
                </div>
              </div>

              {/* ขวา */}
              <div className="text-right">
                <div className="font-bold text-lg">
                  {r.total_score} pts
                </div>
                <div className="text-sm text-gray-600">
                  ⏱ {Math.round(r.total_time)}s
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* ปุ่มจบ */}
      {visibleCount >= results.length && (
        <button
          onClick={onFinish}
          className="mt-10 w-72 py-4 bg-gray-700 text-white rounded-xl text-lg hover:bg-gray-600 transition"
        >
          Finish Game
        </button>
      )}
    </div>
  );
}

export default FinalRankingWithAnimation;