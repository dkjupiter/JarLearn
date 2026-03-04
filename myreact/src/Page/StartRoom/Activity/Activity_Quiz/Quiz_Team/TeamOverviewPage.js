import { useEffect, useState } from "react";
import { socket } from "../../../../../socket";
import { useNavigate, useParams, useLocation } from "react-router-dom";

export default function TeamOverviewPage() {
  const [teams, setTeams] = useState([]);
  const [prevTeams, setPrevTeams] = useState([]);
  const [players, setPlayers] = useState([]);

  const navigate = useNavigate();
  const { classId, joinCode, activitySessionId } = useParams();
  const location = useLocation();

  const studentPerTeam = location.state?.studentPerTeam || 2;

  /* =====================================================
     🔹 REFRESH PREVIEW
  ===================================================== */
  const refreshPreview = () => {
    if (!activitySessionId) return;

    socket.emit("preview_teams", {
      activitySessionId,
      studentPerTeam,
    });
  };

  

  /* =====================================================
     🔹 LOAD ONCE + LISTEN EVENTS
  ===================================================== */
  useEffect(() => {
    if (!activitySessionId) return;

    socket.emit("join_activity", { activitySessionId });

    // โหลดครั้งแรก
    refreshPreview();

    // 🔹 เมื่อ server ส่ง preview กลับมา
    socket.on("preview_teams_data", (newTeams) => {
      console.log("📦 preview_teams_data:", newTeams);
      setPrevTeams(teams);
      setTeams(newTeams);
    });

    // 🔹 เมื่อมีผู้เล่นในห้องเปลี่ยน → refresh preview
    socket.on("room-players", (list) => {
      console.log("👥 room players updated:", list.length);
      setPlayers(list);
      refreshPreview();
    });

    socket.on("player-joined", () => {
      console.log("➕ player joined → refresh preview");
      refreshPreview();
    });

    return () => {
      socket.off("preview_teams_data");
      socket.off("room-players");
      socket.off("player-joined");
    };
  }, [activitySessionId]);

  /* =====================================================
     🔹 NEW MEMBER ANIMATION
  ===================================================== */
  const isNewMember = (teamId, studentId) => {
    const prevTeam = prevTeams.find((t) => t.teamId === teamId);
    if (!prevTeam) return true;
    return !prevTeam.members.some((m) => m.Student_ID === studentId);
  };

  /* =====================================================
     🔹 START QUIZ
  ===================================================== */
  const handleStart = () => {
    socket.emit("start_quiz_with_teams", {
      activitySessionId,
      studentPerTeam,
    });

    navigate(`/room/quiz/${classId}/${joinCode}/${activitySessionId}`);
  };

  /* =====================================================
     🔹 UI
  ===================================================== */
  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <h1 className="text-4xl font-bold text-center mb-10">
        Quiz Team Overview
      </h1>

      {teams.length === 0 && (
        <p className="text-center text-gray-500">
          Waiting for students...
        </p>
      )}

      {teams.map((team) => (
        <div key={team.teamId} className="mb-10">
          <h2 className="text-2xl font-semibold mb-4">
            {team.teamName}
          </h2>

          <div className="grid grid-cols-3 gap-6">
            {team.members.map((m) => {
              const isNew = isNewMember(team.teamId, m.Student_ID);

              return (
                <div
                  key={m.Student_ID}
                  className={`text-center transition-all duration-500 ${
                    isNew ? "animate-floating" : ""
                  }`}
                >
                  <div className="w-24 h-24 mx-auto bg-gray-300 rounded-full mb-2" />
                  <p>{m.Student_Name}</p>
                </div>
              );
            })}
          </div>
        </div>
      ))}

      <div className="text-center mt-10">
        <button
          onClick={handleStart}
          className="px-8 py-3 bg-black text-white rounded-xl"
        >
          Start Quiz
        </button>
      </div>
    </div>
  );
}