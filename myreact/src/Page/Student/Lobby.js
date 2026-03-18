import { useEffect, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { socket } from "../../socket";


const Lobby = () => {
  const location = useLocation();
  // const { playerData,joinCode } = location.state || {};
  const [players, setPlayers] = useState([]);
  const navigate = useNavigate();
  const { joinCode } = useParams();
  const savedPlayer = localStorage.getItem("student_meta");
  const playerData = savedPlayer ? JSON.parse(savedPlayer) : null;
  const currentUser = playerData;
  const [quizPayload, setQuizPayload] = useState(null);


  useEffect(() => {
    if (!playerData || !joinCode) return;

    console.log("🎧 Lobby listening");

    const handleRoomPlayers = (playersInRoom) => {
      console.log("📥 room-players", playersInRoom);
      setPlayers(playersInRoom);
    };

    socket.on("room-players", handleRoomPlayers);
    // socket.on("player-joined", handlePlayerJoined);

    socket.emit("join-room", {
      joinCode,
      player: playerData,
    });

    return () => {
      socket.off("room-players", handleRoomPlayers);
      // socket.off("player-joined", handlePlayerJoined);
    };
  }, [joinCode]);   // ❗ เอา playerData ออก  



  useEffect(() => {
    socket.emit("get_active_activity", { classId: 1 });
  }, []);


  useEffect(() => {

    const activitySessionId = localStorage.getItem("activity_session");

    if (activitySessionId && playerData) {

      console.log("🔁 rejoin activity after refresh");

      socket.emit("join_activity", {
        activitySessionId,
        studentId: playerData.studentId
      });

    }

  }, []);

  

  useEffect(() => {
    const handler = (payload) => {
      console.log("🎯 activity_started", payload);
      console.log("activity_started payload =", payload);

      localStorage.setItem(
        "activity_session",
        payload.activitySessionId
      );


       // 🔥 เข้าห้อง activity ทันที
      socket.emit("join_activity", {
        activitySessionId: payload.activitySessionId,
        studentId: playerData.studentId
      });

    
       if (payload.activityType === "quiz") {

        setQuizPayload(payload);   // ⭐ เก็บ payload ไว้ก่อน

        if (payload.mode == "individual") {

          navigate(`/class/${joinCode}/lobby/quiz/${payload.activitySessionId}`,{
            state:{
              ...payload,
              studentId: playerData.studentId
            }
          });

        }

      }

      /* =====================
         POLL
      ===================== */

      if (payload.activityType === "poll") {

        navigate(`/class/${joinCode}/lobby/poll/${payload.activitySessionId}`)
        console.log("navigate poll →", `/class/${joinCode}/${payload.activitySessionId}`)

      }

      /* =====================
         CHAT / BOARD
      ===================== */

      if (payload.activityType === "chat") {

        navigate(`/class/${joinCode}/lobby/chat/${payload.activitySessionId}`)
        console.log("navigate chat →", `/class/${joinCode}/${payload.activitySessionId}`)

      }

    };

    socket.on("activity_started", handler);

    return () => socket.off("activity_started", handler);
  }, [joinCode]);

  useEffect(() => {

    const handleTeamsCreated = ({ activitySessionId, teams }) => {

      console.log("teams_created", teams);

      navigate(`/class/${joinCode}/lobby/team/${activitySessionId}`,{
        state:{
          ...quizPayload,
          teams,
          studentId: playerData.studentId
        }
      });

    };

    socket.on("teams_created", handleTeamsCreated);

    return () => {
      socket.off("teams_created", handleTeamsCreated);
    };

  }, [quizPayload]);

  useEffect(() => {
    const handler = () => {
      console.log("🚪 Room closed by teacher");

      localStorage.clear();

      if (!localStorage.getItem("student_meta")) {
      navigate("/", { replace: true });
    }
    };

    socket.on("room_closed", handler);

    return () => socket.off("room_closed", handler);
  }, [navigate]);
    


  return (
    <div className="flex flex-col min-h-screen bg-slate-900 text-slate-100">

      {/* Scrollable content */}
      <div className="flex-1 overflow-y-auto px-4 pt-6 pb-24">
        <h1 className="text-2xl font-bold mb-1">Lobby</h1>

        <p className="mb-6 text-slate-400">
          Waiting for teacher to start...
        </p>

        {/* Player Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6">

          {players.map((player) => {
            const isCurrent =
              currentUser &&
              String(player.studentId) === String(currentUser.studentId);

            return (
              <div
                key={player.socketId}
                className={`flex flex-col items-center p-3 rounded-xl
                transition-transform duration-300 animate-floating hover:scale-105
                ${
                  isCurrent
                    ? "bg-slate-800 border-2 border-cyan-400 shadow-lg shadow-cyan-400/30"
                    : "bg-slate-800 border border-slate-700"
                }`}
              >

                {/* Avatar */}
                <div
                  className="relative rounded-full overflow-hidden transition-all duration-300
                  w-20 h-20 sm:w-24 sm:h-24"
                >
                  <img
                    src={player.avatar?.bodyPath}
                    className="absolute inset-0 w-full h-full object-contain"
                    alt=""
                  />

                  <img
                    src={player.avatar?.costumePath}
                    className="absolute inset-0 w-full h-full object-contain"
                    alt=""
                  />

                  <img
                    src={player.avatar?.hairPath}
                    className="absolute inset-0 w-full h-full object-contain"
                    alt=""
                  />

                  <img
                    src={player.avatar?.facePath}
                    className="absolute inset-0 w-full h-full object-contain"
                    alt=""
                  />
                </div>

                {/* Stage name */}
                <span
                  className={`mt-3 font-medium truncate max-w-full text-center
                  ${
                    isCurrent
                      ? "text-cyan-400 text-base sm:text-lg"
                      : "text-slate-300 text-sm sm:text-base"
                  }`}
                >
                  {String(player.stageName)}
                </span>
              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
};

export default Lobby;

