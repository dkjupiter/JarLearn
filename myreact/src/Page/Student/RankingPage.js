// import { useState, useEffect } from "react";
// import Navbar from "../Navbar";
// import { motion } from "framer-motion";
// import Confetti from "react-confetti";

// function RankingPage() {
//   // 5 → 1
//   const ranking = [
//     { rank: 5, name: "Player 5" },
//     { rank: 4, name: "Player 4" },
//     { rank: 3, name: "Player 3" },
//     { rank: 2, name: "Player 2" },
//     { rank: 1, name: "Player 1" },
//   ];

//   const [visibleIndex, setVisibleIndex] = useState(-1);
//   const [showFirework, setShowFirework] = useState(false);

//   useEffect(() => {
//     ranking.forEach((_, i) => {
//       setTimeout(() => {
//         setVisibleIndex(i);

//         if (i === ranking.length - 1) {
//           setShowFirework(true);
//           setTimeout(() => setShowFirework(false), 6000);
//         }
//       }, i * 2000);
//     });
//   }, []);

//   return (
//     <div className="w-full min-h-screen bg-white flex flex-col items-center pt-[80px] relative overflow-hidden">
//       <Navbar />

//       {showFirework && <Confetti numberOfPieces={500} recycle={false} />}

//       <h1 className="text-3xl font-bold mt-6 mb-8">Finish Game</h1>

//       <div className="w-11/12 flex flex-col-reverse space-y-5 space-y-reverse">
//         {ranking.map((player, index) =>
//           index <= visibleIndex ? (
//             <motion.div
//               key={index}
//               initial={{ opacity: 0, y: 30, scale: 0.8 }}
//               animate={{ opacity: 1, y: 0, scale: 1 }}
//               transition={{ duration: 0.5, type: "spring" }}
//               className={`w-full rounded-2xl flex items-center p-4
//                 ${
//                   player.rank <= 3
//                     ? "bg-yellow-300" // ⭐ สีเหลืองสำหรับ Top 3
//                     : "bg-gray-300"
//                 }
//               `}
//             >
//               {/* วงกลมเฉพาะ Top 3 */}
//               {player.rank <= 3 ? (
//                 <div className="w-14 h-14 rounded-full border-2 border-black flex items-center justify-center font-bold text-2xl mr-4">
//                   {player.rank}
//                 </div>
//               ) : (
//                 <div className="w-14 text-xl font-bold mr-4 text-center">
//                   {player.rank}
//                 </div>
//               )}

//               {/* ชื่อ */}
//               <span
//                 className={`font-medium ${
//                   player.rank <= 3 ? "text-2xl" : "text-lg"
//                 }`}
//               >
//                 {player.name}
//               </span>
//             </motion.div>
//           ) : (
//             <div key={index} className="h-[80px]"></div>
//           )
//         )}
//       </div>

//       {/* Buttons */}
//       <div className="mt-16 w-full flex flex-col items-center space-y-6">
//         <button className="bg-gray-600 text-white w-10/12 py-4 rounded-2xl text-lg hover:bg-gray-400">
//           วิเคราะห์เกม
//         </button>

//         <button className="border border-gray-400 text-black w-10/12 py-4 rounded-2xl text-lg hover:bg-gray-400">
//           Back to lobby
//         </button>
//       </div>
//     </div>
//   );
// }

// export default RankingPage;


import { useEffect, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import Navbar from "../Navbar";
import { Crown } from "lucide-react";
import { socket } from "../../socket";


function RankingPage({ activitySessionId, studentId, mode }) {

  // const location = useLocation();
  const navigate = useNavigate();
  const { joinCode } = useParams();

  // const { activitySessionId, studentId, mode } = location.state || {};

  const [myRank, setMyRank] = useState(null);
  const savedPlayer = localStorage.getItem("student_meta");
  const playerData = savedPlayer ? JSON.parse(savedPlayer) : null;

  const [avatar, setAvatar] = useState(null);
  const [stageName, setStageName] = useState(null);

  const isTeamMode = mode === "team";

  const [teamName, setTeamName] = useState(null);
  const [teamScore, setTeamScore] = useState(null);
  const [teamRank, setTeamRank] = useState(null);
  const displayRank = isTeamMode ? teamRank : myRank;

  useEffect(() => {
    if (!studentId) return;

    socket.emit("request_my_profile", { studentId });

    const handler = (data) => {
      setStageName(data.stageName);
      setAvatar(data.avatar);
    };

    socket.on("my_profile_data", handler);

    return () => socket.off("my_profile_data", handler);
  }, [studentId]);

  /* ================= GET RANK ================= */

  useEffect(() => {

    if (!activitySessionId || !studentId) return;

    socket.emit("request_my_rank", {
      activitySessionId,
      studentId
    });

    const handler = ({ rank, teamRank, teamScore, teamName }) => {

      if (rank !== undefined) {
        setMyRank(rank);
      }

      if (teamRank !== undefined) {
        setTeamRank(teamRank);
      }

      if (teamScore !== undefined) {
        setTeamScore(teamScore);
      }

      if (teamName !== undefined) {
        setTeamName(teamName);
      }
    };

    socket.on("my_rank_update", handler);

    return () => socket.off("my_rank_update", handler);

  }, [activitySessionId, studentId]);

  /* ================= FORCE BACK TO LOBBY ================= */

  useEffect(() => {

    const handler = () => {
      console.log("🔴 teacher ended activity → back to lobby");

      localStorage.removeItem("quiz_meta");
      localStorage.removeItem("quiz_phase");
      localStorage.removeItem("quiz_q_index");

      navigate(`/class/${joinCode}/lobby`);
    };

    socket.on("force_back_to_lobby", handler);

    return () => socket.off("force_back_to_lobby", handler);

  }, [joinCode, navigate]);

  /* ================= RENDER ================= */

  if (!activitySessionId || !studentId) {
    return <div className="p-10 text-center">Ranking data missing</div>;
  }

  if (displayRank === null) {
    return <div className="p-10 text-center">Calculating rank...</div>;
  }

  return (
    <div className="w-full min-h-screen bg-slate-900 text-slate-100 flex flex-col items-center pt-[80px] pb-16">
      <Navbar />

      <h1 className="text-4xl font-bold mt-8">Ranking</h1>

      <div className="relative mt-16">

        {displayRank >= 1 && displayRank <= 5 && (
          <Crown
            className="w-16 h-16 absolute -top-10 left-1/3 -translate-x-1/2 text-amber-400 animate-bounce z-10"
          />
        )}

        <div className="relative w-[220px] h-[220px] rounded-full overflow-hidden bg-slate-800 border-4 border-slate-700 shadow-[0_0_30px_rgba(34,211,238,0.35)]">
          <img src={avatar?.bodyPath} className="absolute inset-0 w-full h-full object-contain" />
          <img src={avatar?.costumePath} className="absolute inset-0 w-full h-full object-contain" />
          <img src={avatar?.hairPath} className="absolute inset-0 w-full h-full object-contain" />
          <img src={avatar?.facePath} className="absolute inset-0 w-full h-full object-contain" />
        </div>

      </div>

      {!isTeamMode ? (
        // 👤 individual mode
        <>
          <p className="text-2xl font-bold mt-4">{stageName}</p>

          <h2 className="text-3xl font-bold mt-6 text-slate-300">
            Your Rank
          </h2>

          <div className="flex items-center gap-2 mt-1">
            <Crown className="w-6 h-6 text-amber-400" />
            <p className="text-3xl font-bold text-cyan-400">#{myRank}</p>
          </div>
        </>
      ) : (
        // 👥 team mode
        <>
          <p className="text-2xl font-bold mt-4 text-cyan-400">{teamName}</p>

          <h2 className="text-3xl font-bold mt-6 text-slate-300">
            Team Score
          </h2>

          <p className="text-3xl font-semibold text-cyan-400">{teamScore}</p>

          <h2 className="text-3xl font-bold mt-6 text-slate-300">
            Your Team Rank
          </h2>

          <div className="flex items-center gap-2 mt-1">
            <Crown className="w-6 h-6 text-amber-400" />
            <p className="text-3xl font-bold text-cyan-400">#{teamRank}</p>
          </div>
        </>
      )}
    </div>
  );
}

export default RankingPage;