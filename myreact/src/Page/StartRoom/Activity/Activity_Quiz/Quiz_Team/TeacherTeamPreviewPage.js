import { useEffect, useState } from "react";
import { socket } from "../../../../../socket";
import { useNavigate, useParams } from "react-router-dom";

export default function TeacherTeamPreviewPage() {

  const [teams, setTeams] = useState([]);

  const navigate = useNavigate();
  const { classId, joinCode, activitySessionId } = useParams();

  useEffect(() => {

    const handleTeams = (data) => {
      console.log("👥 teams_created", data);
      console.log(data[0].members)
      setTeams(data);
    };

    socket.on("teams_created", handleTeams);

    return () => {
      socket.off("teams_created", handleTeams);
    };

  }, []);

  useEffect(() => {

    socket.emit("get_teams", {
      activitySessionId
    });

    const handleTeams = (data) => {
      setTeams(data);
      console.log("🔥 teams_data:", data);
    };

    socket.on("teams_data", handleTeams);
    
    return () => socket.off("teams_data", handleTeams);

  }, [activitySessionId]);


  const handleStartQuiz = () => {

    socket.emit("start_team_quiz", {
      activitySessionId
    });

    navigate(`/room/quiz/${classId}/${joinCode}/${activitySessionId}`);

  };

  return (

    <div className="min-h-screen bg-slate-900 text-slate-100 p-4 md:p-8">

      <h1 className="text-3xl md:text-4xl font-bold text-center mb-10">
        Teams
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">

        {teams.map(team => (

          <div
            key={team.teamId}
            className="bg-slate-800 border border-slate-700 rounded-2xl shadow-lg p-6 w-full max-w-md mx-auto"
          >

            <h2 className="text-xl md:text-2xl font-semibold mb-6 text-center text-cyan-400">
              {team.teamName}
            </h2>

            <div className="flex flex-wrap justify-center gap-6">

              {team.members.map(member => (

                <div
                  key={member.Student_ID}
                  className="flex flex-col items-center animate-floating"
                >

                  {/* Avatar */}
                  <div className="relative w-20 h-20 md:w-24 md:h-24">

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

                  <p className="mt-2 text-sm md:text-base font-medium text-center text-slate-200">
                    {member.Student_Name}
                  </p>

                </div>

              ))}

            </div>

          </div>

        ))}

      </div>

      <div className="text-center mt-12">

        <button
          onClick={handleStartQuiz}
          className="
          px-10 py-3 rounded-xl
          bg-cyan-400 text-slate-900 font-semibold
          hover:bg-cyan-300 hover:scale-[1.02]
          shadow-lg shadow-cyan-400/30
          transition
          "
        >
          Start Quiz
        </button>

      </div>

    </div>
  );

}