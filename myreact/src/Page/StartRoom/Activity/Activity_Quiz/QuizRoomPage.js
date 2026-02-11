import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { socket } from "../../../../socket";

// Teacher paced
import Activity_quiz_single from "./Quiz_Question/Quiz_Single";
import Activity_quiz_multiple from "./Quiz_Question/Quiz_Multi";
import Activity_quiz_ordering from "./Quiz_Question/Quiz_Ordering";
import Solution_quiz_select_choice from "./Quiz_Solution/Solution_Quiz";

// Progress
import QuizProgressPage from "./Progress_Quiz/QuizProgressPage";

// Ranking
import Ranking from "./Quiz_Ranking/RankingPage";
import FinalRankingWithAnimation from "./Quiz_Ranking/FinalRanking";

// Game Analysis
import GameAnalysis from "./Game_Analysis/GameAnalysis";

// Report
import ReportPage from "./Report_Quiz/Quiz_Report";

export default function QuizRoomPage() {
  const { classId, joinCode, activitySessionId } = useParams();

  const [assignedQuiz, setAssignedQuiz] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);

  // phase ใช้ร่วมทุกโหมด
  const [phase, setPhase] = useState("question");

  const [rankingResults, setRankingResults] = useState([]);
  const [finalRanking, setFinalRanking] = useState([]);

  /* =================================================
     Teacher paced: next phase
  ================================================= */
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
      socket.emit("next_question", {
        activitySessionId: Number(activitySessionId),
      });
      setPhase("question");
    }

    else if (phase === "final-ranking") {
      socket.emit("end_quiz", {
        activitySessionId: Number(activitySessionId),
      });
      setPhase("report");
    }

    else if (phase === "report") {
      socket.emit("next_question", {
        activitySessionId: Number(activitySessionId),
      });
      setPhase("gameanalysis");
    }
  }

  /* =================================================
     Load quiz
  ================================================= */
  useEffect(() => {
    socket.emit("get_assigned_quiz", { activitySessionId });

    const handler = (res) => {
      if (!res.success) return;
      setAssignedQuiz(res.assignedQuiz);
      setQuestions(groupQuestions(res.questions));
    };

    socket.on("assigned_quiz_data", handler);
    return () => socket.off("assigned_quiz_data", handler);
  }, [activitySessionId]);

  useEffect(() => {
    socket.emit("join_activity", {
      activitySessionId: Number(activitySessionId),
    });
  }, [activitySessionId]);

  useEffect(() => {
    const handler = ({ index }) => {
      console.log("👨‍🏫 teacher received start_question:", index);

      setCurrentIndex(index);
      setPhase("question");
    };

    socket.on("start_question", handler);
    return () => socket.off("start_question", handler);
  }, []);

  /* =================================================
     Question ranking (teacher paced)
  ================================================= */
  // useEffect(() => {
  //   socket.on("question_ranking", setRankingResults);
  //   return () => socket.off("question_ranking");
  // }, []);

  useEffect(() => {
    const handler = (data) => {
      setRankingResults(data);
    };

    socket.on("question_ranking", handler);
    return () => socket.off("question_ranking", handler);
  }, []);

  /* =================================================
     Final ranking (ทุกโหมดใช้ร่วม)
  ================================================= */
  useEffect(() => {
    if (phase !== "final-ranking") return;

    socket.emit("get_final_ranking", { activitySessionId });

    const handler = (data) => setFinalRanking(data);
    socket.on("final_ranking_data", handler);

    return () => socket.off("final_ranking_data", handler);
  }, [phase, activitySessionId]);

  /* =================================================
     AUTO FINISH (สำหรับ progress mode)
  ================================================= */
  useEffect(() => {
    const handler = ({ activitySessionId: finishedId }) => {
      if (Number(finishedId) === Number(activitySessionId)) {
        setPhase("final-ranking");
      }
    };

    socket.on("quiz_auto_finished", handler);
    return () => socket.off("quiz_auto_finished", handler);
  }, [activitySessionId]);

  if (!assignedQuiz || questions.length === 0) {
    return <p className="text-center mt-20">Loading quiz...</p>;
  }

  const quizMode = assignedQuiz.Timer_Type;
  const currentQuestion = questions[currentIndex];

  /* =================================================
     PROGRESS MODE (question_timer / quiz_timer / manual_end)
  ================================================= */

  if (quizMode !== "teacher") {

    if (phase === "final-ranking") {
      return (
        <FinalRankingWithAnimation
          results={finalRanking}
          onFinish={() => setPhase("report")}
        />
      );
    }

    if (phase === "report") {
      return (
        <ReportPage
          activitySessionId={activitySessionId}
          onNext={() => setPhase("gameanalysis")}
          beforePage={"Play_Quiz"}
          classId={classId}
          joinCode={joinCode}
          onOpenAnalysis={() => setPhase("gameanalysis")}
        />
      );
    }

    if (phase === "gameanalysis") {
      return (
        <GameAnalysis
          activitySessionId={activitySessionId}
          questions={questions}
          classId={classId}
          joinCode={joinCode}
          beforePage="Play_Quiz"
          onBack={() => setPhase("report")}
        />
      );
    }

    // 🔥 progress page หลัก
    return (
      <QuizProgressPage
        activitySessionId={activitySessionId}
        totalQuestions={questions.length}
        mode={quizMode}                     // question_timer | quiz_timer | manual_end
        quizTimeLimit={assignedQuiz.Quiz_Time}
        onEndQuiz={() => setPhase("final-ranking")}
      />
    );
  }

  /* =================================================
     TEACHER PACED MODE (ของเดิม)
  ================================================= */
  if (!currentQuestion) {
    return <p className="text-center mt-20">Loading question...</p>;
  }

  const handleNext = () => {
    if (quizMode !== "teacher") return;

    socket.emit("force_submit", {
      activitySessionId: Number(activitySessionId),
    });
    if (quizMode === "teacher") {
      setPhase("solution");
    }
  };

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
        StudentAnswers={0}
        onNext={nextPhase}
      />
    );
  }

  else if (phase === "ranking") {
    return (
      <Ranking
        question={questions[currentIndex]}
        results={rankingResults}
        onNext={nextPhase}
      />
    );
  }

  else if (phase === "final-ranking") {
    return (
      <FinalRankingWithAnimation
        results={finalRanking}
        onFinish={nextPhase}
      />
    );
  }

  else if (phase === "report") {
    return (
      <ReportPage
        activitySessionId={activitySessionId}
        onNext={nextPhase}
        beforePage={"Play_Quiz"}
        classId={classId}
        joinCode={joinCode}
        onOpenAnalysis={() => {
    setPhase("gameanalysis");
  }}
      />
    );
  }

  else if (phase === "gameanalysis") {
    return (
      <GameAnalysis
        activitySessionId={activitySessionId}
        questions={questions}
        classId={classId}
        joinCode={joinCode}
        beforePage="Play_Quiz"
        onBack={() => setPhase("report")}
      />
    );
  }

  return null;
}

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

    if (r.Correct_Option_ID) {
      map[r.Question_ID].correctOptionIds.add(r.Correct_Option_ID);
    }

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
