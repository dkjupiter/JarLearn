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
      studentPerTeam
    });
  };

  /* =====================================================
     🔹 LOAD ONCE + LISTEN EVENTS
  ===================================================== */
  useEffect(() => {

    if (!activitySessionId) return;

    socket.emit("join_activity", { activitySessionId });

    const handleJoined = () => {
      refreshPreview();
    };

    socket.on("joined_activity", handleJoined);

    socket.on("preview_teams_data", (newTeams) => {
      console.log("📦 preview_teams_data:", newTeams);
      setPrevTeams(teams);
      setTeams(newTeams);
    });

    socket.on("room-players", (list) => {
      setPlayers(list);
      refreshPreview();
    });

    socket.on("player-joined", () => {
      refreshPreview();
    });

    return () => {
      socket.off("joined_activity", handleJoined);
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
     🔹 Create Team
  ===================================================== */
  const handleCreateTeams = () => {

    socket.emit("create_teams", {
      activitySessionId,
      teams
    });

  };

  useEffect(()=>{

    const handleTeamsCreated = () => {
      navigate(`/room/teacher-preview/${classId}/${joinCode}/${activitySessionId}`);
    };

    socket.on("teams_created", handleTeamsCreated);

    return ()=> socket.off("teams_created", handleTeamsCreated);

  },[])

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
                  <div className="relative w-24 h-24 mx-auto rounded-full overflow-hidden mb-2">
                    <img
                      src={m.avatar?.bodyPath}
                      className="absolute inset-0 w-full h-full object-contain"
                      alt=""
                    />
                    <img
                      src={m.avatar?.costumePath}
                      className="absolute inset-0 w-full h-full object-contain"
                      alt=""
                    />
                    <img
                      src={m.avatar?.hairPath}
                      className="absolute inset-0 w-full h-full object-contain"
                      alt=""
                    />
                    <img
                      src={m.avatar?.facePath}
                      className="absolute inset-0 w-full h-full object-contain"
                      alt=""
                    />
                  </div>
                  <p>{m.Student_Name}</p>
                </div>
              );
            })}
          </div>
        </div>
      ))}

      <div className="text-center mt-10">
        <button
          onClick={handleCreateTeams}
          className="px-8 py-3 bg-black text-white rounded-xl"
        >
          Create Teams
        </button>
      </div>
    </div>
  );
}