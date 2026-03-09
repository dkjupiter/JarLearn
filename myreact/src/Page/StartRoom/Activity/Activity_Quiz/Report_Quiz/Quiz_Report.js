import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { socket } from "../../../../../socket";
import Sidebar_account from "../../../../Sidebar_account";
import ScoreDistributionChart from "./ScoreDistributionChart";
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
    answerAnalytics: [],
    scores: [],
  });

  useEffect(() => {
    if (!activitySessionId) return;

    socket.emit("get_quiz_report", {
      activitySessionId,
    });

    const handler = (data) => {
      if (!data) return;

      setReport({
        // backend ส่ง key = student
        students: data.student ?? [],
        overall: data.overall ?? {},
        eachQuestion: data.eachQuestion ?? [],
        answerAnalytics: data.answerAnalytics ?? [],
        scores: data.scores ?? [],
      });

    };

    socket.on("quiz_report_data", handler);

    return () => {
      socket.off("quiz_report_data", handler);
    };
  }, [activitySessionId]);

  const {
    students = [],
    overall = {},
    eachQuestion = [],
    answerAnalytics = [],
    scores = [],
  } = report;

  const byStudent = {};
  for (const s of students) {
    if (!byStudent[s.Student_ID]) {
      byStudent[s.Student_ID] = {
        Student_ID: s.Student_ID,
        name: s.Student_Name,
        total_score: 0,
      };
    }
    byStudent[s.Student_ID].total_score += s.is_correct ? 100 : 0;
  }
  const chartData = Object.values(byStudent);

  console.log("chartData:", activitySessionId);

  // รวมคะแนนต่อคน
const scoreByStudent = {};

students.forEach((s) => {
  if (!scoreByStudent[s.Student_ID]) {
    scoreByStudent[s.Student_ID] = 0;
  }
  scoreByStudent[s.Student_ID] += s.is_correct ? 1 : 0;
});

const studentScores = Object.values(scoreByStudent);


  const maxScore = Math.max(...studentScores);
  console.log("maxScore:", maxScore);

  const minScore = Math.min(...studentScores);
  console.log("minScore:", minScore);

  const maxQuestion = eachQuestion.length

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="fixed top-0 left-0 w-full bg-white shadow-md z-10">
        <Sidebar_account />
      </div>
      {beforePage === "Play_Quiz" && (<div className="h-16" />)}

      <h1 className="text-3xl font-bold text-center my-6">
        Report
      </h1>

      <div className="max-w-md mx-auto border rounded-2xl p-5 space-y-6">

        {/* Score Chart */}
        <div className="bg-gray-200 rounded-xl p-4">
          <p className="text-center mb-3 text-gray-700">
            ช่วงคะแนนนักเรียนของควิซนี้
          </p>

          <ScoreDistributionChart students={students} step={5} />
        </div>

        {/* Overall */}
        <div>
          <h2 className="text-xl font-bold mb-2">Overall</h2>
          <div className="space-y-1 text-sm">
            <p>All Question : {maxQuestion}</p>
            <p>Average Score : {overall.avgAccuracy ?? 0}%</p>
            {/* <p>Many Mistakes : {overall.manyMistakes ?? 0}</p> */}
            <p>Average Time : {overall.avgTime ?? 0} seconds</p>
          </div>

          <div className="flex justify-between mt-3 text-sm">
            <span>Max {maxScore}</span>
            <span>Min {minScore}</span>
          </div>
        </div>

        {/* Each Question */}
        <div>
          <h2 className="text-xl font-bold mb-3">
            Each Question
          </h2>

          {eachQuestion.map((q, i) => (
            <div
              key={`${q.Question_ID}-${i}`}
              className="flex items-center gap-2 mb-2"
            >
              <span className="w-5">{i + 1}</span>
              <div className="flex-1 h-4 bg-gray-200 rounded">
                <div
                  className="h-full bg-gray-500 rounded"
                  style={{ width: `${q.correct_percent ?? 0}%` }}
                />
              </div>
              <span className="w-10 text-right text-sm">
                {q.correct_percent ?? 0}%
              </span>
            </div>
          ))}

          {eachQuestion.length === 0 && (
            <p className="text-gray-400 text-sm">
              No question data
            </p>
          )}
        </div>
      </div>

      {/* Buttons */}
      <div className="max-w-md mx-auto mt-6 space-y-3">
        <button
          onClick={() =>
            exportQuizReportExcel({
              students,
              eachQuestion,
              overall,
            })
          }
          className="w-full py-3 bg-gray-600 text-white rounded-xl"
        >
          Export Excel
        </button>

        {onOpenAnalysis && (
          <button
            onClick={() => onOpenAnalysis?.(activitySessionId, beforePage, classId, joinCode)}
            className="w-full py-3 border rounded-xl"
          >
            Game Analysis
          </button>
        )}

        {!onOpenAnalysis && (
          <button
            onClick={() => navigate("/gameanalysis", {
              state: {
                activitySessionId,
                beforePage,
                classId,
                joinCode,
              },
            })}
            className="w-full py-3 border rounded-xl"
          >
            Game Analysis
          </button>
        )}


        {beforePage === "Play_Quiz" && (
          <button
            onClick={() => {
              socket.emit("end_activity_and_kick_students", {
                activitySessionId,
                joinCode
              });
              navigate(`/room/assign/${classId}/${joinCode}`);
            }}
            className="w-full py-3 border rounded-xl"
          >
            Back
          </button>
        )}

      </div>
    </div>
  );
}

export default ReportPage;
