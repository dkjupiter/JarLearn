import { useState, useEffect } from "react";
// import Navbar from "../Navbar";
import { motion } from "framer-motion";
import Confetti from "react-confetti";

function RankingPage() {
  // 5 → 1
  const ranking = [
    { rank: 5, name: "Player 5" },
    { rank: 4, name: "Player 4" },
    { rank: 3, name: "Player 3" },
    { rank: 2, name: "Player 2" },
    { rank: 1, name: "Player 1" },
  ];

  const [visibleIndex, setVisibleIndex] = useState(-1);
  const [showFirework, setShowFirework] = useState(false);

  useEffect(() => {
    ranking.forEach((_, i) => {
      setTimeout(() => {
        setVisibleIndex(i);

        if (i === ranking.length - 1) {
          setShowFirework(true);
          setTimeout(() => setShowFirework(false), 6000);
        }
      }, i * 2000);
    });
  }, []);

  return (
    <div className="w-full min-h-screen bg-white flex flex-col items-center pt-[80px] relative overflow-hidden">
      {/* <Navbar /> */}

      {showFirework && <Confetti numberOfPieces={500} recycle={false} />}

      <h1 className="text-3xl font-bold mt-6 mb-8">Finish Game</h1>

      <div className="w-11/12 flex flex-col-reverse space-y-5 space-y-reverse">
        {ranking.map((player, index) =>
          index <= visibleIndex ? (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30, scale: 0.8 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.5, type: "spring" }}
              className={`w-full rounded-2xl flex items-center p-4
                ${
                  player.rank <= 3
                    ? "bg-yellow-300" // ⭐ สีเหลืองสำหรับ Top 3
                    : "bg-gray-300"
                }
              `}
            >
              {/* วงกลมเฉพาะ Top 3 */}
              {player.rank <= 3 ? (
                <div className="w-14 h-14 rounded-full border-2 border-black flex items-center justify-center font-bold text-2xl mr-4">
                  {player.rank}
                </div>
              ) : (
                <div className="w-14 text-xl font-bold mr-4 text-center">
                  {player.rank}
                </div>
              )}

              {/* ชื่อ */}
              <span
                className={`font-medium ${
                  player.rank <= 3 ? "text-2xl" : "text-lg"
                }`}
              >
                {player.name}
              </span>
            </motion.div>
          ) : (
            <div key={index} className="h-[80px]"></div>
          )
        )}
      </div>

      {/* Buttons */}
      <div className="mt-16 w-full flex flex-col items-center space-y-6">
        <button className="bg-gray-600 text-white w-10/12 py-4 rounded-2xl text-lg hover:bg-gray-400">
          วิเคราะห์เกม
        </button>

        <button className="border border-gray-400 text-black w-10/12 py-4 rounded-2xl text-lg hover:bg-gray-400">
          Back to lobby
        </button>
      </div>
    </div>
  );
}

export default RankingPage;
