import React, { useEffect, useState } from "react";
import Segment from "./Segment";
import Radio from "./Radio";

import { useTeacher } from "../../TeacherContext";

import { socket } from "../../../socket"; // path ตามโปรเจกต์คุณ


export default function QuizSection({ onChange }) {
  const [mode, setMode] = useState("individual");
  const [studentPerTeam, setStudentPerTeam] = useState("");
  const [timerType, setTimerType] = useState("teacher");
  const [questionTime, setQuestionTime] = useState("");
  const [quizTime, setQuizTime] = useState("");
  const [selectedQuiz, setSelectedQuiz] = useState(null);

  const [quizzes, setQuizzes] = useState([]);

  const { teacherId } = useTeacher();

  const timerGuide = {
  teacher: {
    title: "Teacher Paced",
    desc: "Teacher controls the flow. Ideal for discussion and explanation.",
  },
  question: {
    title: "Question Timer",
    desc: "Each question has a time limit. Great for quick assessments.",
  },
  quiz: {
    title: "Quiz Timer",
    desc: "Students must complete the entire quiz within the time limit.",
  },
  manual: {
    title: "Manual End",
    desc: "No time limit. End the quiz whenever you are ready.",
  },
};

  const [search, setSearch] = useState("");
  const filteredQuizzes = quizzes.filter((q) =>
    q.name.toLowerCase().includes(search.toLowerCase())
  );

  useEffect(() => {
    if (!selectedQuiz) return;

    if (
      (timerType === "teacher" || timerType === "question") &&
      (!Number.isFinite(questionTime) || questionTime <= 0)
    ) {
      console.log("⏳ waiting for valid questionTime");
      return;
    }

    if (
      timerType === "quiz" &&
      (!Number.isFinite(quizTime) || quizTime <= 0)
    ) {
      console.log("⏳ waiting for valid quizTime");
      return;
    }

    const payload = {
      quizId: selectedQuiz,
      mode,
      studentPerTeam: mode === "team" ? Number(studentPerTeam) : null,
      timerType,
      questionTime:
        timerType === "teacher" || timerType === "question"
          ? questionTime
          : null,
      quizTime: timerType === "quiz" ? quizTime : null,
    };

    console.log("📤 Quiz config changed (VALID):", payload);
    onChange?.(payload);
  }, [
    selectedQuiz,
    mode,
    studentPerTeam,
    timerType,
    questionTime,
    quizTime,
  ]);

  useEffect(() => {
    if (!teacherId) return;

    // console.log("📤 ขอ quiz list teacherId =", teacherId);
    socket.emit("get_question_sets", teacherId);
  }, [teacherId]);

  useEffect(() => {
    const handler = (data) => {
      // console.log("📚 quiz list:", data);

      if (!Array.isArray(data)) {
        setQuizzes([]);
        return;
      }

      setQuizzes(
        data.map((q) => ({
          id: q.Set_ID,
          name: q.Title,
          lastEdit: q.Question_Last_Edit,
        }))
      );
    };

    socket.on("question_sets_data", handler);

    return () => {
      socket.off("question_sets_data", handler);
    };
  }, []);

  return (
    <div className="space-y-4">

      <div className="flex gap-4">
        <Radio
          label="Individual"
          checked={mode === "individual"}
          onClick={() => setMode("individual")}
        />
        <Radio
          label="Team"
          checked={mode === "team"}
          onClick={() => setMode("team")}
        />
      </div>

      {mode === "team" && (
        <input
          type="number"
          min={2}
          placeholder="Student per team (min 2)"
          value={studentPerTeam}
          onChange={(e) => {
            const value = Number(e.target.value);

            if (value < 2) {
              setStudentPerTeam("");
              return;
            }

            setStudentPerTeam(value);
          }}
          className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3
                 text-slate-100 placeholder-slate-500
                 focus:outline-none focus:ring-2 focus:ring-cyan-400"
        />
      )}

      <Segment
        value={timerType}
        onChange={setTimerType}
        options={[
          { key: "teacher", label: "Teacher\nPaced" },
          { key: "question", label: "Question\ntimer" },
          { key: "quiz", label: "Quiz\ntimer" },
          { key: "manual", label: "Manual\nend" },
        ]}
      />

      {/* Timer Guide */}
<div className="bg-slate-800 border border-slate-700 rounded-xl p-4 text-sm">
  <p className="font-semibold text-cyan-400">
    {timerGuide[timerType]?.title}
  </p>
  <p className="text-slate-300">
    {timerGuide[timerType]?.desc}
  </p>
</div>

      {(timerType === "teacher" || timerType === "question") && (
        <input
          type="number"
          min={0}
          placeholder="Question time (seconds)"
          value={questionTime}
          onChange={(e) => {
            const value = Number(e.target.value);
            if (value < 0) return;
            setQuestionTime(value);
          }}
          className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3
                 text-slate-100 placeholder-slate-500
                 focus:outline-none focus:ring-2 focus:ring-cyan-400"
        />
      )}

      {timerType === "quiz" && (
        <input
          type="number"
          min={0}
          placeholder="Quiz end time (minutes)"
          value={quizTime}
          onChange={(e) => {
            const value = Number(e.target.value);
            if (value < 0) return;
            setQuizTime(value);
          }}
          className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3
                 text-slate-100 placeholder-slate-500
                 focus:outline-none focus:ring-2 focus:ring-cyan-400"
        />
      )}

      <div className="border border-slate-700 rounded-2xl p-4 space-y-4 bg-slate-800">
        <input
          placeholder="Search quiz name"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full bg-slate-900 border border-slate-700 rounded-full px-5 py-3
                 text-slate-100 placeholder-slate-500
                 focus:outline-none focus:ring-2 focus:ring-cyan-400"
        />

        <div className="space-y-2 max-h-64 overflow-y-auto">
          {filteredQuizzes.length === 0 && (
            <p className="text-sm text-slate-500 text-center py-4">
              No quiz found
            </p>
          )}

          {filteredQuizzes.map((q) => (
            <div
              key={q.id}
              onClick={() => {
                setSelectedQuiz(q.id);
                setSearch(q.name);
              }}
              className={`px-4 py-3 rounded-lg cursor-pointer transition
            ${selectedQuiz === q.id
                  ? "bg-cyan-400 text-slate-900"
                  : "bg-slate-700 text-slate-200 hover:bg-slate-600"
                }`}
            >
              {q.name}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}