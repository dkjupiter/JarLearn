import { useEffect, useRef } from "react";

function Ranking({ question, results, onNext }) {

  const top5 = [...results]
    .sort((a, b) => b.score - a.score)
    .slice(0, 5);

  const maxScore = Math.max(...top5.map(r => r.score), 1);

  const prevPositions = useRef(new Map());
  const refs = useRef({});

  /* FLIP animation */
  useEffect(() => {

    const newPositions = new Map();

    top5.forEach((r) => {

      const el = refs.current[r.name];
      if (!el) return;

      const rect = el.getBoundingClientRect();
      newPositions.set(r.name, rect.top);

      const prevTop = prevPositions.current.get(r.name);

      if (prevTop !== undefined) {

        const delta = prevTop - rect.top;

        if (delta !== 0) {

          el.style.transform = `translateY(${delta}px)`;

          requestAnimationFrame(() => {
            el.style.transition = "transform 500ms ease";
            el.style.transform = "";
          });

        }

      }

    });

    prevPositions.current = newPositions;

  }, [top5]);

  return (
    <div className="w-full min-h-screen bg-slate-900 text-slate-100 flex flex-col items-center px-4 py-10">

      <h2 className="text-3xl font-bold mb-2 text-cyan-400">
        Leaderboard
      </h2>

      <p className="text-slate-400 mb-8 text-center max-w-xl">
        {question.Question_Text}
      </p>

      <div className="w-full max-w-xl space-y-4 mb-10">

        {top5.map((r, index) => {

          const percent = (r.score / maxScore) * 100;

          const bg =
            index === 0
              ? "border-yellow-400"
              : index === 1
              ? "border-slate-300"
              : index === 2
              ? "border-orange-400"
              : "border-slate-700";

          return (
            <div
              key={r.name}
              ref={(el) => (refs.current[r.name] = el)}
              className={`relative px-6 py-4 rounded-xl border bg-slate-800 overflow-hidden transition-all duration-500 ${bg}`}
            >

              {/* score race bar */}
              <div
                className="absolute left-0 top-0 h-full bg-cyan-400/20 transition-all duration-700"
                style={{ width: `${percent}%` }}
              />

              <div className="relative flex justify-between items-center">

                <div className="flex items-center gap-4">

                  <div className="text-xl font-bold">
                    {index === 0 ? "👑" : index + 1}
                  </div>

                  <div className="font-medium text-lg">
                    {r.name}
                  </div>

                </div>

                <div className="text-right">

                  <div className="font-bold text-lg">
                    {r.score} pts
                  </div>

                  <div className="text-sm text-slate-400">
                    ⏱ {r.time}s
                  </div>

                </div>

              </div>

            </div>
          );
        })}

      </div>

      <button
        onClick={onNext}
        className="w-72 py-3 rounded-lg
        bg-cyan-400 text-slate-900 font-semibold
        hover:bg-cyan-300 hover:scale-[1.02]
        shadow-lg shadow-cyan-400/30 transition"
      >
        Next Question
      </button>

    </div>
  );
}

export default Ranking;