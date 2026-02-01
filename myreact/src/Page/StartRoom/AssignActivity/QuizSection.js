import React, { useEffect, useState } from "react";
import Segment from "./Segment";
import Radio from "./Radio";

import { useTeacher } from "../../TeacherContext";

import { socket } from "../../../socket"; // path ตามโปรเจกต์คุณ


export default function QuizSection({onChange}) {
  const [mode, setMode] = useState("individual");
  const [studentPerTeam, setStudentPerTeam] = useState("");
  const [timerType, setTimerType] = useState("teacher");
  const [questionTime, setQuestionTime] = useState("");
  const [quizTime, setQuizTime] = useState("");
  const [selectedQuiz, setSelectedQuiz] = useState(null);

  const [quizzes, setQuizzes] = useState([]);

  const { teacherId } = useTeacher();

  const [search, setSearch] = useState("");
  const filteredQuizzes = quizzes.filter((q) =>
    q.name.toLowerCase().includes(search.toLowerCase())
  );

  useEffect(() => {
    if (!selectedQuiz) return;

    const payload = {
      quizId: selectedQuiz,
      mode,
      studentPerTeam: mode === "team" ? studentPerTeam : null,
      timerType,
      questionTime: timerType === "question" ? questionTime : null,
      quizTime: timerType === "quiz" ? quizTime : null,
    };

    console.log("📤 Quiz config changed:", payload);
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

    console.log("📤 ขอ quiz list teacherId =", teacherId);
    socket.emit("get_question_sets", teacherId);
  }, [teacherId]);

  useEffect(() => {
    const handler = (data) => {
      console.log("📚 quiz list:", data);

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
    <>
      <div className="flex gap-8">
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
          placeholder="Student per team"
          value={studentPerTeam}
          onChange={(e) => setStudentPerTeam(e.target.value)}
          className="w-full border rounded-xl px-4 py-3"
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

      {(timerType === "teacher" || timerType === "question") && (
        <input
          type="number"
          placeholder="Question time (secionds)"
          value={questionTime}
          onChange={(e) => setQuestionTime(e.target.value)}
          className="w-full border rounded-xl px-4 py-3"
        />
      )}

      {timerType === "quiz" && (
        <input
          type="number"
          placeholder="Quiz end time (minutes)"
          value={quizTime}
          onChange={(e) => setQuizTime(e.target.value)}
          className="w-full border rounded-xl px-4 py-3"
        />
      )}

      <div className="border rounded-2xl p-4 space-y-4 bg-white">
        {/* Search */}
        <input
          placeholder="Search quiz name"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full border rounded-full px-5 py-3"
        />

        {/* Quiz list */}
        <div className="space-y-2 max-h-64 overflow-y-auto">
          {filteredQuizzes.length === 0 && (
            <p className="text-sm text-gray-400 text-center py-4">
              No quiz found
            </p>
          )}

          {filteredQuizzes.map((q) => (
            <div
              key={q.id}
              onClick={() => setSelectedQuiz(q.id)}
              className={`px-4 py-3 rounded-lg cursor-pointer transition ${
                selectedQuiz === q.id
                  ? "bg-gray-300 text-black"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              {q.name}
            </div>
          ))}
        </div>
      </div>

    </>
  );
}
