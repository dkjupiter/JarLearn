import { useEffect, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import Navbar from "../Navbar";
import { socket } from "../../socket";

export default function EndQuizPageTeam() {

  const { state } = useLocation();

  const activitySessionId =
    state?.activitySessionId || localStorage.getItem("activitySessionId");

  const studentId =
    state?.studentId || localStorage.getItem("studentId");

  const navigate = useNavigate();
  const { joinCode } = useParams();

  const [playerName, setPlayerName] = useState("");
  const [finalScore, setFinalScore] = useState(0);
  const [teamName, setTeamName] = useState("");
  const [avatar, setAvatar] = useState(null);

  /* ================= GET FINAL RESULT ================= */

  useEffect(() => {

    if (!activitySessionId || !studentId) return;

    socket.emit("get_final_result", {
      activitySessionId,
      studentId
    });

  }, [activitySessionId, studentId]);

  useEffect(() => {

    const handler = ({ name, score, teamName }) => {
      setPlayerName(name);
      setFinalScore(score);
      setTeamName(teamName);
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

  /* ================= SHOW TEAM RANKING ================= */

  useEffect(() => {

    const handler = () => {

      navigate(`/class/${joinCode}/lobby/quiz/${activitySessionId}/end/team`, {
        state: { activitySessionId, studentId }
      });

    };

    socket.on("show_final_team_ranking", handler);

    return () => socket.off("show_final_team_ranking", handler);

  }, [joinCode, activitySessionId, studentId]);

  /* ================= FORCE BACK ================= */

  useEffect(() => {

    const handler = () => {

      localStorage.removeItem("quiz_meta");
      localStorage.removeItem("quiz_phase");
      localStorage.removeItem("quiz_q_index");

      navigate(`/class/${joinCode}/lobby`);

    };

    socket.on("force_back_to_lobby", handler);

    return () => socket.off("force_back_to_lobby", handler);

  }, [joinCode]);

  return (

    <div className="w-full min-h-screen bg-slate-900 text-slate-100 flex flex-col items-center pt-[80px]">

      <Navbar />

      <h1 className="text-4xl font-bold mt-4 pb-8">
        Your Score
      </h1>

      {/* Avatar */}
      <div className="relative w-[220px] h-[220px] rounded-full overflow-hidden bg-slate-800 border-4 border-slate-700 shadow-[0_0_30px_rgba(34,211,238,0.35)]">

        <img src={avatar?.bodyPath} className="absolute inset-0 w-full h-full object-contain" />
        <img src={avatar?.costumePath} className="absolute inset-0 w-full h-full object-contain" />
        <img src={avatar?.hairPath} className="absolute inset-0 w-full h-full object-contain" />
        <img src={avatar?.facePath} className="absolute inset-0 w-full h-full object-contain" />

      </div>

      {/* Team Name */}
      <p className="text-xl font-bold mt-6 text-cyan-400">
        {teamName}
      </p>

      {/* Player Name */}
      <p className="text-slate-400">
        {playerName}
      </p>

      {/* Score */}
      <h2 className="text-2xl font-medium mt-6 text-slate-300">
        Your Final Score :
      </h2>

      <p className="text-4xl font-bold text-cyan-400 mt-1">
        {finalScore}
      </p>

      {/* Waiting */}
      <p className="text-md mt-8 text-slate-400 italic">
        Waiting for teacher to reveal final team result...
      </p>

    </div>

  );
}