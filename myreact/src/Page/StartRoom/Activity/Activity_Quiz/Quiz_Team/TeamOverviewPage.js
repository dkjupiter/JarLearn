// import { useEffect, useState } from "react";
// import { socket } from "../../../../../socket";
// import { useNavigate, useParams, useLocation } from "react-router-dom";

// export default function TeamOverviewPage() {
//   const [teams, setTeams] = useState([]);
//   const [prevTeams, setPrevTeams] = useState([]);
//   const navigate = useNavigate();
//   const { classId, joinCode, activitySessionId } = useParams();
//   const location = useLocation();

//   const studentPerTeam = location.state?.studentPerTeam || 2;

//   // 🔄 Auto refresh preview
//   useEffect(() => {
//     const fetchPreview = () => {
//       socket.emit("preview_teams", {
//         activitySessionId,
//         studentPerTeam
//       });
//     };

//     fetchPreview();

//     const interval = setInterval(fetchPreview, 3000);

//     socket.on("preview_teams_data", (newTeams) => {
//       setPrevTeams(teams);
//       setTeams(newTeams);
//     });

//     return () => {
//       clearInterval(interval);
//       socket.off("preview_teams_data");
//     };
//   }, [activitySessionId, teams]);

//   // 🔍 เช็คสมาชิกใหม่
//   const isNewMember = (teamId, studentId) => {
//     const prevTeam = prevTeams.find(t => t.teamId === teamId);
//     if (!prevTeam) return true;
//     return !prevTeam.members.some(m => m.Student_ID === studentId);
//   };

//   const handleStart = () => {
//     socket.emit("start_quiz_with_teams", {
//       activitySessionId,
//       studentPerTeam
//     });

//     setTimeout(() => {
//       navigate(`/room/quiz/${classId}/${joinCode}/${activitySessionId}`);
//     }, 300);
//   };

//   return (
//     <div className="min-h-screen bg-gray-100 p-8">
//       <h1 className="text-4xl font-bold text-center mb-10">
//         Quiz Team Overview
//       </h1>

//       {teams.length === 0 && (
//         <p className="text-center text-gray-500">
//           Waiting for students...
//         </p>
//       )}

//       {teams.map((team) => (
//         <div key={team.teamId} className="mb-10">
//           <h2 className="text-2xl font-semibold mb-4">
//             {team.teamName}
//           </h2>

//           <div className="grid grid-cols-3 gap-6">
//             {team.members.map((m) => {
//               const isNew = isNewMember(team.teamId, m.Student_ID);

//               return (
//                 <div
//                   key={m.Student_ID}
//                   className={`text-center transition-all duration-500
//                     ${isNew ? "animate-bounce" : ""}
//                   `}
//                 >
//                   <div className="w-24 h-24 mx-auto bg-gray-300 rounded-full mb-2" />
//                   <p>{m.Student_Name}</p>
//                 </div>
//               );
//             })}
//           </div>
//         </div>
//       ))}

//       <div className="text-center mt-10">
//         <button
//           onClick={handleStart}
//           className="px-8 py-3 bg-black text-white rounded-xl"
//         >
//           Start Quiz
//         </button>
//       </div>
//     </div>
//   );
// }
import { useEffect, useState } from "react";
import { socket } from "../../../../../socket";
import { useNavigate, useParams, useLocation } from "react-router-dom";

export default function TeamOverviewPage() {
  const [teams, setTeams] = useState([]);
  const [prevTeams, setPrevTeams] = useState([]);
  const navigate = useNavigate();
  const { classId, joinCode, activitySessionId } = useParams();
  const location = useLocation();

  const studentPerTeam = location.state?.studentPerTeam || 2;

  // 🔄 Auto refresh preview
  useEffect(() => {
    const fetchPreview = () => {
      socket.emit("preview_teams", {
        activitySessionId,
        studentPerTeam
      });
    };

    fetchPreview();

    const interval = setInterval(fetchPreview, 3000);

    socket.on("preview_teams_data", (newTeams) => {
      setPrevTeams(teams);
      setTeams(newTeams);
    });

    return () => {
      clearInterval(interval);
      socket.off("preview_teams_data");
    };
  }, [activitySessionId, teams]);

  // 🔍 เช็คสมาชิกใหม่
  const isNewMember = (teamId, studentId) => {
    const prevTeam = prevTeams.find(t => t.teamId === teamId);
    if (!prevTeam) return true;
    return !prevTeam.members.some(m => m.Student_ID === studentId);
  };

  const handleStart = () => {
    socket.emit("start_quiz_with_teams", {
      activitySessionId,
      studentPerTeam
    });

    setTimeout(() => {
      navigate(`/room/quiz/${classId}/${joinCode}/${activitySessionId}`);
    }, 300);
  };

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
                  className={`text-center transition-all duration-500
                    ${isNew ? "animate-bounce" : ""}
                  `}
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
