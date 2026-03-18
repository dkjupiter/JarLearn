import { useEffect, useState } from "react";
import { useLocation , useNavigate, useParams } from "react-router-dom";
import Navbar from "../Navbar";
import { socket } from "../../socket";
import { Crown } from "lucide-react";

function FinalTeamRankingPage() {

  const { state } = useLocation();
  const { activitySessionId, studentId } = state || {};

  const navigate = useNavigate();
  const { joinCode } = useParams();

  const [playerName, setPlayerName] = useState("");
  const [avatar, setAvatar] = useState(null);

  const [playerScore, setPlayerScore] = useState(0);
  const [teamName, setTeamName] = useState("");
  const [teamScore, setTeamScore] = useState(0);
  const [teamRank, setTeamRank] = useState(null);

  /* ================= GET FINAL RESULT ================= */

  useEffect(() => {

    if (!activitySessionId || !studentId) return;

    socket.emit("get_final_result", {
      activitySessionId,
      studentId
    });

  }, [activitySessionId, studentId]);


  useEffect(() => {

    const handler = ({
      name,
      score,
      teamName,
      teamScore,
      teamRank
    }) => {

      setPlayerName(name);
      setPlayerScore(score);

      setTeamName(teamName);
      setTeamScore(teamScore);
      setTeamRank(teamRank);

    };

    socket.on("final_result", handler);
    return () => socket.off("final_result", handler);

  }, []);


  /* ================= GET AVATAR ================= */

  useEffect(() => {

    if (!studentId) return;

    socket.emit("request_my_profile", { studentId });

    const handler = (data) => {
      setPlayerName(data.stageName);
      setAvatar(data.avatar);
    };

    socket.on("my_profile_data", handler);
    return () => socket.off("my_profile_data", handler);

  }, [studentId]);


  /* ================= FORCE BACK ================= */

  useEffect(() => {

    const handler = () => {

      navigate(`/class/${joinCode}/lobby`);

    };

    socket.on("force_back_to_lobby", handler);
    return () => socket.off("force_back_to_lobby", handler);

  }, [joinCode]);


  return (

    <div className="w-full min-h-screen bg-slate-900 text-slate-100 flex flex-col items-center pt-[80px] pb-10">

      <Navbar />

      <h1 className="text-4xl font-bold mt-8">
        Final Team Ranking
      </h1>

      {/* Avatar */}
      <div className="relative mt-16">

        {(teamRank >= 1 && teamRank <= 5) && (
          <Crown
            className="w-16 h-16 absolute -top-10 left-1/3 -translate-x-1/2 text-amber-400 animate-bounce z-10"
          />
        )}

        <div className="relative w-[220px] h-[220px] rounded-full overflow-hidden bg-slate-800 border-4 border-slate-700 shadow-[0_0_30px_rgba(34,211,238,0.35)]">

          <img src={avatar?.bodyPath} className="absolute inset-0 w-full h-full object-contain"/>
          <img src={avatar?.costumePath} className="absolute inset-0 w-full h-full object-contain"/>
          <img src={avatar?.hairPath} className="absolute inset-0 w-full h-full object-contain"/>
          <img src={avatar?.facePath} className="absolute inset-0 w-full h-full object-contain"/>

        </div>

      </div>

      {/* Team Name */}
      <p className="text-2xl font-bold mt-4 text-cyan-400">
        {teamName}
      </p>

      {/* Player Name */}
      <p className="text-slate-400">
        {playerName}
      </p>

      {/* Player Score */}
      <h2 className="text-2xl font-medium mt-6 text-slate-300">
        Your Final Score :
      </h2>

      <p className="text-4xl font-bold text-cyan-400">
        {playerScore}
      </p>

      {/* Team Score */}
      <h2 className="text-2xl font-medium mt-6 text-slate-300">
        Final Team Score :
      </h2>

      <p className="text-3xl font-bold text-cyan-400">
        {teamScore}
      </p>

      {/* Team Rank */}
      <h2 className="text-2xl font-medium mt-6 text-slate-300">
        Your Team Rank :
      </h2>

      <div className="flex items-center gap-2 mt-1">

        {(teamRank >= 1 && teamRank <= 5) && (
          <Crown className="w-6 h-6 text-amber-400"/>
        )}

        <p className="text-3xl font-bold text-cyan-400">
          {teamRank !== null ? `#${teamRank}` : "-"}
        </p>

      </div>

      <div className="mt-16 w-full flex flex-col items-center space-y-6">

        <button
          onClick={() =>
            navigate(`/class/${joinCode}/lobby/quiz/${activitySessionId}/end/analysis`, {
              state: { activitySessionId, studentId }
            })
          }
          className="
            bg-cyan-400 text-slate-900 w-10/12 py-4 rounded-xl text-lg font-semibold
            hover:bg-cyan-300 transition-all duration-200 active:scale-95
          "
        >
          Game Analysis
        </button>

      </div>

    </div>

  );
}

export default FinalTeamRankingPage;