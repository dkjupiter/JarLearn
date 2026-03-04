import { useEffect, useState } from "react";
import confetti from "canvas-confetti";
import { socket } from "../../../../../socket";
import { Trophy, Crown, Medal, Award } from "lucide-react";

function FinalRankingWithAnimation({
  activitySessionId,
  results = [],
  onFinish
}) {

  const [step, setStep] = useState(0);

  const sorted = [...results].sort(
    (a, b) => b.total_score - a.total_score
  );

  const top3 = sorted.slice(0, 3);
  const others = sorted.slice(3);

  /* reveal animation */
  useEffect(() => {

    if (step >= 3) return;

    const timer = setTimeout(() => {
      setStep(s => s + 1);
    }, step === 2 ? 1800 : 1000); // drumroll ก่อนอันดับ 1

    return () => clearTimeout(timer);

  }, [step]);

  /* confetti champion */
  useEffect(() => {

    if (step === 3) {

      confetti({
        particleCount: 200,
        spread: 120,
        origin: { y: 0.6 }
      });

      const audio = new Audio("/sounds/win.mp3");
      audio.volume = 0.6;
      audio.play().catch(() => { });

    }

  }, [step]);

  return (
    <div className="w-full min-h-screen bg-slate-900 text-slate-100 flex flex-col items-center px-4 pt-8 pb-20">

      <h1 className="flex items-center gap-2 text-3xl font-bold mb-6 text-yellow-400">
        <Trophy size={28} />
        Final Ranking
      </h1>

      {/* ===== Podium Reveal ===== */}
      <div className="w-full max-w-sm flex flex-col-reverse gap-3 mb-8">

        {step >= 1 && top3[2] && (
          <div className="px-4 py-3 rounded-xl bg-orange-400 text-slate-900
    flex justify-between items-center
    animate-fadePop">

            <span>#3 {top3[2].name}</span>
            <span>{top3[2].total_score}</span>

          </div>
        )}

        {step >= 2 && top3[1] && (
          <div className="px-4 py-3 rounded-xl bg-slate-300 text-slate-900
    flex justify-between items-center
    animate-fadePop">

            <span>#2 {top3[1].name}</span>
            <span>{top3[1].total_score}</span>

          </div>
        )}

        {step >= 3 && top3[0] && (
          <div className="px-4 py-4 rounded-xl bg-yellow-400 text-slate-900
    flex justify-between items-center font-bold
    shadow-xl shadow-yellow-400/40
     animate-floating">

          <div className="relative w-28 h-28 rounded-full overflow-hidden
  border-4 border-yellow-400 shadow-lg shadow-yellow-400/40">

    <img src={top3[0].avatar?.bodyPath} className="absolute inset-0 w-full h-full object-contain" />
    <img src={top3[0].avatar?.costumePath} className="absolute inset-0 w-full h-full object-contain" />
    <img src={top3[0].avatar?.hairPath} className="absolute inset-0 w-full h-full object-contain" />
    <img src={top3[0].avatar?.facePath} className="absolute inset-0 w-full h-full object-contain" />

  </div>

            <div className="flex gap-3">
              <Crown size={20} />
              <span>#1 {top3[0].name}</span>
            </div>
            <span>{top3[0].total_score}</span>

          </div>
        )}

      </div>

      {/* ===== Other ranks ===== */}
      <div className="w-full max-w-sm space-y-2">

        {others.map((r, i) => {

          const rank = i + 4;

          return (
            <div
              key={r.name || r.Student_ID}
              className="flex justify-between items-center px-4 py-3 rounded-lg bg-slate-800 border border-slate-700"
            >

              <div className="flex items-center gap-3">

                <span className="text-sm font-bold text-slate-400">
                  #{rank}
                </span>

                <span className="text-sm">
                  {r.name || `Student ${r.Student_ID}`}
                </span>

              </div>

              <span className="text-sm text-slate-300">
                {r.total_score}
              </span>

            </div>
          );
        })}

      </div>

      {/* Finish Button */}
      <button
        onClick={() => {

          socket.emit("finish_quiz_session", {
            activitySessionId
          });

          onFinish();

        }}
        className="fixed bottom-6 left-1/2 -translate-x-1/2 w-72 py-3 rounded-lg
        bg-cyan-400 text-slate-900 font-semibold
        hover:bg-cyan-300
        shadow-lg shadow-cyan-400/30 transition"
      >
        Finish Game
      </button>

    </div>
  );
}

export default FinalRankingWithAnimation;