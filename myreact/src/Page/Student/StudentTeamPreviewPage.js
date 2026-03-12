import { useEffect, useState } from "react";
import { socket } from "../../socket";
import { useLocation, useNavigate, useParams } from "react-router-dom";

export default function StudentTeamPreviewPage() {

  const [myTeam, setMyTeam] = useState(null);

  const navigate = useNavigate();
  const location = useLocation();
  const { joinCode } = useParams();

  // โหลด payload (กัน refresh หน้า)
  const payload =
    location.state ||
    JSON.parse(sessionStorage.getItem("quiz_payload"));

  const {
    activitySessionId,
    studentId,
    teams
  } = payload || {};
  console.log("activitySessionId:", activitySessionId);

  // =============================
  // save payload กัน refresh
  // =============================
  useEffect(() => {

    if (location.state) {
      sessionStorage.setItem(
        "quiz_payload",
        JSON.stringify(location.state)
      );
    }

  }, [location.state]);



  // =============================
  // join activity room
  // =============================
  useEffect(() => {

    if (!activitySessionId) return;

    socket.emit("join_activity", {
      activitySessionId,
      studentId
    });

  }, [activitySessionId, studentId]);

  // =============================
  // หา team ของ student
  // =============================

  useEffect(() => {

    if (!activitySessionId) return;

    socket.emit("get_teams", {
      activitySessionId
    });

  }, [activitySessionId]);

  useEffect(() => {

    const handleTeams = (data) => {

      const team = data.find(t =>
        t.members.some(m =>
          String(m.Student_ID) === String(studentId)
        )
      )

      setMyTeam(team)

    }

    socket.on("teams_data", handleTeams)

    return () => socket.off("teams_data", handleTeams)

  }, [studentId])

  // =============================
  // start question
  // =============================
  useEffect(() => {

    const handleStart = ({ index }) => {

      console.log("🚀 quiz starting");

      navigate(`/class/${joinCode}/lobby/quiz/${activitySessionId}`, {
        state: {
          ...payload,
          startIndex: index
        }
      });

    };

    socket.on("start_question", handleStart);

    return () => {
      socket.off("start_question", handleStart);
    };

  }, [activitySessionId, payload, joinCode]);

  // =============================
  // loading
  // =============================
  if (!myTeam) {

    return (
      <div className="flex items-center justify-center min-h-screen text-xl">
        Waiting for teams...
      </div>
    );

  }

  // =============================
  // UI
  // =============================
  return (

    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col items-center justify-center px-4">

      <h1 className="text-3xl md:text-4xl font-bold mb-8 text-center">
        Your Team
      </h1>

      <div className="bg-slate-800 border border-slate-700 rounded-xl shadow-lg p-8 w-full max-w-md">

        <h2 className="text-xl md:text-2xl font-semibold mb-8 text-center text-cyan-400">
          {myTeam.teamName}
        </h2>

        {/* สมาชิกทีม */}
        <div className="flex flex-wrap justify-center gap-8">

          {myTeam.members.map(member => (

            <div
              key={member.Student_ID}
              className="flex flex-col items-center animate-floating"
            >

              {/* Avatar */}
              <div className="relative w-20 h-20 md:w-24 md:h-24 rounded-full overflow-hidden">

                <img
                  src={member.avatar?.bodyPath}
                  className="absolute inset-0 w-full h-full object-contain"
                  alt=""
                />

                <img
                  src={member.avatar?.costumePath}
                  className="absolute inset-0 w-full h-full object-contain"
                  alt=""
                />

                <img
                  src={member.avatar?.hairPath}
                  className="absolute inset-0 w-full h-full object-contain"
                  alt=""
                />

                <img
                  src={member.avatar?.facePath}
                  className="absolute inset-0 w-full h-full object-contain"
                  alt=""
                />

              </div>

              {/* Name */}
              <p className="mt-2 text-sm md:text-lg font-medium text-center text-slate-200">
                {member.Student_Name}
              </p>

            </div>

          ))}

        </div>

      </div>

      <p className="mt-6 text-slate-400 text-center italic">
        Waiting for teacher to start...
      </p>

    </div>

  );

}