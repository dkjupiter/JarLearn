import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { socket } from "../../../../socket";

import Activity_quiz_single from "./Quiz_Question/Quiz_Single";
import Activity_quiz_multiple from "./Quiz_Question/Quiz_Multi";
import Activity_quiz_ordering from "./Quiz_Question/Quiz_Ordering";

import Solution_quiz_select_choice from "./Quiz_Solution/Solution_Quiz";

import Ranking from "./Quiz_Ranking/RankingPage";
import FinalRankingWithAnimation from "./Quiz_Ranking/FinalRanking";

import GameAnalysis from "./Game_Analysis/GameAnalysis";

import ReportPage from "./Report_Quiz/Quiz_Report";

export default function QuizRoomPage() {
  const { activitySessionId } = useParams();

  const [assignedQuiz, setAssignedQuiz] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  
  const [phase, setPhase] = useState("question");

  // const results = [
  //   { name: "Alice", score: 118, time: 4 },
  //   { name: "Bob", score: 110, time: 5 },
  //   { name: "Charlie", score: 96, time: 7 },
  //   { name: "Dana", score: 90, time: 8 },
  //   { name: "Eve", score: 82, time: 9 },
  //   { name: "Frank", score: 70, time: 12 },
  // ];

  const [rankingResults, setRankingResults] = useState([]);

  const [finalRanking, setFinalRanking] = useState([]);

  // type Phase =
  // | "question"
  // | "solution"
  // | "ranking"
  // | "final-ranking"
  // | "end";

  function nextPhase() {
    if (phase === "question") {
      setPhase("solution");
    }

    else if (phase === "solution") {
      socket.emit("calculate_ranking", {
          activitySessionId: Number(activitySessionId),
          quizId: assignedQuiz.AssignedQuiz_ID,
          questionId: currentQuestion.Question_ID,
          questionType: currentQuestion.Question_Type,
          maxTime: assignedQuiz.Question_Time,
        });
      if (currentIndex < questions.length - 1) {
        setPhase("ranking");
      } else {
        setPhase("final-ranking");
      }
      
    }

    else if (phase === "ranking") {
      setCurrentIndex(i => i + 1);
      setPhase("question")
    }

    else if (phase === "final-ranking") {
      setPhase("report");
    }

    else if (phase === "report") {
      setPhase("gameanalysis");
    }
  }

  useEffect(() => {
    socket.emit("get_assigned_quiz", { activitySessionId });

    const handler = (res) => {
      if (!res.success) return;

      console.log("RAW QUESTIONS:", res.questions);

      const grouped = groupQuestions(res.questions);
      console.log("GROUPED QUESTIONS:", grouped);

      setAssignedQuiz(res.assignedQuiz);
      setQuestions(grouped);
    };

    socket.on("assigned_quiz_data", handler);
    return () => socket.off("assigned_quiz_data", handler);
  }, [activitySessionId]);

  useEffect(() => {
    const handler = (data) => {
      setRankingResults(data);
    };

    socket.on("question_ranking", handler);
    return () => socket.off("question_ranking", handler);
  }, []);

  useEffect(() => {
    if (phase !== "final-ranking") return;

    socket.emit("get_final_ranking", { activitySessionId });

    const handler = (data) => {
      setFinalRanking(data);
    };

    socket.on("final_ranking_data", handler);
    return () => socket.off("final_ranking_data", handler);
  }, [phase]);

  if (!assignedQuiz || questions.length === 0) {
    return <p className="text-center mt-20">Loading quiz...</p>;
  }

  const quizMode = assignedQuiz.Timer_Type;
  const currentQuestion = questions[currentIndex];

  const handleNext = () => {
    if (quizMode === "teacher") {
      setPhase("solution");
    }
  };

  if (!currentQuestion) {
    return <p className="text-center mt-20">Loading question...</p>;
  }

  if (phase === "question") {
    switch (currentQuestion.Question_Type) {
      case "single":
        return (
          <Activity_quiz_single
            question={currentQuestion}
            current={currentIndex + 1}
            total={questions.length}
            timeLimit={assignedQuiz.Question_Time}
            onNext={handleNext}
            onTimeUp={handleNext}
          />
        );

      case "multiple":
        return (
          <Activity_quiz_multiple
            question={currentQuestion}
            current={currentIndex + 1}
            total={questions.length}
            timeLimit={assignedQuiz.Question_Time}
            onNext={handleNext}
            onTimeUp={handleNext}
          />
        );

      case "ordering":
        return (
          <Activity_quiz_ordering
            question={currentQuestion}
            current={currentIndex + 1}
            total={questions.length}
            timeLimit={assignedQuiz.Question_Time}
            onNext={handleNext}
            onTimeUp={handleNext}
          />
        );

      default:
        return <p>Unknown question type</p>;
    }
  }

  else if (phase === "solution") {
    return (
          <Solution_quiz_select_choice
            question={currentQuestion}
            current={currentIndex + 1}
            total={questions.length}
            studentAnswer={0} // 👈 เดี๋ยวเปลี่ยนเป็นของจริงทีหลัง
            onNext={nextPhase}
          />
        );
  }

  else if (phase === "ranking") {
    return (
      <Ranking
        question={questions[currentIndex]}
        // results={results} // 👈 เดี๋ยวเปลี่ยนเป็นของจริงทีหลัง
        results={rankingResults}
        onNext={nextPhase}
      />
    );
  }

  else if ( phase === "final-ranking" ) {
    return (
      <FinalRankingWithAnimation
        results={finalRanking}
        onFinish={nextPhase}
      />
    );
  }

  else if ( phase === "report" ) {
    return (
      <ReportPage
        activitySessionId={activitySessionId}
        onNext={nextPhase}
      />
    );
  }

  else if ( phase === "gameanalysis" ) {
    return (
      <GameAnalysis
        activitySessionId={activitySessionId}
        questions={questions}
        onNext={nextPhase}
      />
    );
  }

  else if ( phase === "end" ) {
    return (
      <div className="w-full min-h-screen bg-white flex flex-col items-center justify-center py-6">
        <h2 className="text-2xl font-bold mb-4">Quiz Ended</h2>
        <p className="text-gray-600">Thank you for participating!</p>
      </div>
    );
  }


}

// helperQuestions(rows) {
function groupQuestions(rows) {
  const map = {};

  rows.forEach((r) => {
    if (!map[r.Question_ID]) {
      map[r.Question_ID] = {
        Question_ID: r.Question_ID,
        Question_Text: r.Question_Text,
        Question_Type: r.Question_Type,
        Question_Image: r.Question_Image,
        choices: [],
        correctOptionIds: new Set(),
      };
    }

    // if (r.Option_ID) {
    //   map[r.Question_ID].choices.push({
    //     id: r.Option_ID,
    //     text: r.Option_Text,
    //     isCorrect: r.Is_Correct,
    //   });
    // }
    // ✅ ถ้า row นี้เป็นคำตอบที่ถูก
    if (r.Correct_Option_ID) {
      map[r.Question_ID].correctOptionIds.add(r.Correct_Option_ID);
    }

    // ✅ เก็บตัวเลือก
    if (r.Option_ID) {
      map[r.Question_ID].choices.push({
        id: r.Option_ID,
        text: r.Option_Text,
      });
    }
  });

  return Object.values(map).map((q) => ({
    ...q,
    choices: q.choices.map((c) => ({
      ...c,
      isCorrect: q.correctOptionIds.has(c.id),
    })),
  }));
}