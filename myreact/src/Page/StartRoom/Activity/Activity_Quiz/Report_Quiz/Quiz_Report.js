import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { socket } from "../../../../../socket";
import Sidebar_account from "../../../../Sidebar_account";
import { ScoreDistributionChart } from "./ScoreDistributionChart";
import exportQuizReportExcel from "./exportStudentsCSV";

function ReportPage({
  activitySessionId,
  questions,
  BeforePageContent,
  onOpenAnalysis,
  classId,
  joinCode
}) {

  const navigate = useNavigate();

  const beforePage = BeforePageContent || "Play_Quiz";

  const [report, setReport] = useState({
    students: [],
    overall: {},
    eachQuestion: [],
    scores: []
  });


  /* ===============================
     LOAD REPORT
  =============================== */

  useEffect(() => {

    if (!activitySessionId) return;

    socket.emit("get_quiz_report", {
      activitySessionId
    });

    const handler = (data) => {

      if (!data) return;

      setReport({
        students: data.student ?? [],
        overall: data.overall ?? {},
        eachQuestion: data.eachQuestion ?? [],
        scores: data.scores ?? []
      });

    };

    socket.on("quiz_report_data", handler);

    return () => socket.off("quiz_report_data", handler);

  }, [activitySessionId]);


  const {
    students = [],
    overall = {},
    eachQuestion = [],
    scores = []
  } = report;


  /* ===============================
     SCORE PER STUDENT (จำนวนข้อ)
  =============================== */

  const scoreByStudent = {};

  students.forEach((s) => {

    if (!scoreByStudent[s.Student_ID]) {
      scoreByStudent[s.Student_ID] = 0;
    }

    scoreByStudent[s.Student_ID] += s.is_correct ? 1 : 0;

  });

  const studentScores = Object.values(scoreByStudent);


  const maxScore =
    studentScores.length > 0
      ? Math.max(...studentScores)
      : 0;

  const minScore =
    studentScores.length > 0
      ? Math.min(...studentScores)
      : 0;


  const maxQuestion = eachQuestion.length;



  return (

    <div className="min max-w-4xl mx-auto min-h-screen bg-slate-900 text-slate-100">

      {/* {/* {beforePage === "Play_Quiz" && <div className=" */}
      <div className="h-5" />


      <h1 className="text-3xl font-bold text-center my-6">
        Quiz Report
      </h1>

      <div className="h-3" />
      {/* ================= MAIN CARD ================= */}

      <div className="w-full mx-auto space-y-6 px-4">


        {/* ================= Score Distribution ================= */}

        <div className="bg-slate-800 border border-slate-700 rounded-2xl p-5">

          <h2 className="text-lg font-semibold mb-3 text-center text-cyan-400">
            Score Distribution
          </h2>

          <ScoreDistributionChart
            scores={studentScores}
            step={3}
          />

        </div>



        {/* ================= Overall ================= */}

        <div className="bg-slate-800 border border-slate-700 rounded-2xl p-5">

          <h2 className="text-lg font-semibold mb-4">
            Overall
          </h2>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 text-sm">

            <div className="bg-slate-700 rounded-xl p-3 text-center">

              <p className="text-slate-400 text-xs">
                Questions
              </p>

              <p className="font-semibold">
                {maxQuestion}
              </p>

            </div>


            <div className="bg-slate-700 rounded-xl p-3 text-center">

              <p className="text-slate-400 text-xs">
                Avg Score
              </p>

              <p className="font-semibold">
                {overall.avgAccuracy ?? 0}%
              </p>

            </div>


            <div className="bg-slate-700 rounded-xl p-3 text-center">

              <p className="text-slate-400 text-xs">
                Avg Time
              </p>

              <p className="font-semibold">
                {overall.avgTime ?? 0}s
              </p>

            </div>


            <div className="bg-slate-700 rounded-xl p-3 text-center">

              <p className="text-slate-400 text-xs">
                Score Range
              </p>

              <p className="font-semibold">
                {minScore} - {maxScore}
              </p>

            </div>

          </div>

        </div>



        {/* ================= Each Question ================= */}

        <div className="bg-slate-800 border border-slate-700 rounded-2xl p-5">

          <h2 className="text-lg font-semibold mb-4">
            Each Question
          </h2>


          {eachQuestion.map((q, i) => (

            <div
              key={`${q.Question_ID}-${i}`}
              className="mb-4"
            >

              <div className="flex justify-between text-sm mb-1">

                <span className="font-semibold text-slate-300">
                  Q{i + 1}
                </span>

                <span className="font-semibold">
                  {Math.round(q.correct_percent || 0)}%
                </span>

              </div>


              <div className="w-full h-3 bg-slate-700 rounded-full overflow-hidden">

                <div
                  className="h-full bg-cyan-400 transition-all"
                  style={{
                    width: `${q.correct_percent ?? 0}%`
                  }}
                />

              </div>

            </div>

          ))}


          {eachQuestion.length === 0 && (

            <p className="text-slate-500 text-sm text-center">
              No question data
            </p>

          )}

        </div>



        {/* ================= Buttons ================= */}

        <div className="flex flex-col items-center gap-3 pb-12">

          <button
            onClick={() =>
              exportQuizReportExcel({
                students,
                eachQuestion,
                overall
              })
            }
            className="w-72 py-3 rounded-lg
            bg-cyan-400 text-slate-900 font-semibold
            hover:bg-cyan-300
            shadow-lg shadow-cyan-400/30 transition"
          >
            Export Excel
          </button>


          <button
            onClick={() =>
              onOpenAnalysis?.(
                activitySessionId,
                beforePage,
                classId,
                joinCode
              )
            }
            className="w-72 py-3 rounded-lg
            border border-slate-700
            bg-slate-800
            hover:bg-slate-700 transition"
          >
            Game Analysis
          </button>


          {beforePage === "Play_Quiz" && (

            <button
              onClick={() =>
                navigate(`/room/assign/${classId}/${joinCode}`)
              }
              className="w-72 py-3 rounded-lg
              border border-slate-700
              hover:bg-slate-800 transition"
            >
              Back
            </button>

          )}

        </div>

      </div>

    </div>

  );

}

export default ReportPage;