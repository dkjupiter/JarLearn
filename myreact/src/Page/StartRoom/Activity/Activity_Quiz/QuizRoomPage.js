// import { useEffect, useState } from "react";
// import { useParams } from "react-router-dom";
// import { socket } from "../../../../socket";

// import Activity_quiz_single from "./Quiz_Single";
// import MultiAnsQuizPage from "./Quiz_Multi";

// export default function QuizRoomPage() {
//   const { activitySessionId } = useParams();
//   const [assignedQuiz, setAssignedQuiz] = useState(null);
//   const [questions, setQuestions] = useState([]);
//   const [currentIndex, setCurrentIndex] = useState(0);

// //   useEffect(() => {
// //     socket.emit("get_assigned_quiz", { activitySessionId });

// //     socket.on("assigned_quiz_data", (res) => {
// //       if (!res.success) return;
// //       setAssignedQuiz(res.assignedQuiz);
// //       setQuestions(groupQuestions(res.questions));
// //     });

// //     return () => socket.off("assigned_quiz_data");
// //   }, [activitySessionId]);

//     useEffect(() => {
//         socket.emit("get_assigned_quiz", {
//         activitySessionId,
//         });
    
//     }, [activitySessionId]);
//     socket.on("assigned_quiz_data", (data) => {
//         setAssignedQuiz(data);  
//     });


//   if (!assignedQuiz || questions.length === 0) {
//     return <p className="text-center mt-20">Loading quiz...</p>;
//   }

//   const currentQuestion = questions[currentIndex];

//   // 🔥 เลือก UI ตาม question type
// //   if (currentQuestion.Question_Type === "single") {
// //     return (
// //       <Activity_quiz_single
// //         question={currentQuestion}
// //         current={currentIndex + 1}
// //         total={questions.length}
// //       />
// //     );
// //   }

// //   if (currentQuestion.Question_Type === "multiple") {
// //     return (
// //       <MultiAnsQuizPage
// //         question={currentQuestion}
// //         current={currentIndex + 1}
// //         total={questions.length}
// //       />
// //     );
// //   }

// //   return <p>Ordering quiz (ยังไม่ทำ)</p>;
//     if (!assignedQuiz) return <Loading />;

//     switch (assignedQuiz.Quiz_Type) {
//     case "single":
//         return <Quiz_Single data={assignedQuiz} />;
//     case "multiple":
//         return <Quiz_Multi data={assignedQuiz} />;
//     case "ordering":
//         return <Quiz_Ordering data={assignedQuiz} />;
//     }

// }

// // helper
// function groupQuestions(rows) {
//   const map = {};

//   rows.forEach((r) => {
//     if (!map[r.Question_ID]) {
//       map[r.Question_ID] = {
//         Question_ID: r.Question_ID,
//         Question_Text: r.Question_Text,
//         Question_Type: r.Question_Type,
//         Image_URL: r.Image_URL,
//         choices: [],
//       };
//     }

//     if (r.Choice_ID) {
//       map[r.Question_ID].choices.push({
//         id: r.Choice_ID,
//         text: r.Choice_Text,
//         isCorrect: r.Is_Correct,
//       });
//     }
//   });

//   return Object.values(map);
// }
// import { useEffect, useState } from "react";
// import { useParams } from "react-router-dom";
// import { socket } from "../../../../socket";

// import Activity_quiz_single from "./Quiz_Single";
// import MultiAnsQuizPage from "./Quiz_Multi";
// // import Quiz_Ordering from "./Quiz_Ordering";

// export default function QuizRoomPage() {
//   const { activitySessionId } = useParams();
//   const [assignedQuiz, setAssignedQuiz] = useState(null);
//   const [questions, setQuestions] = useState([]);

// //   useEffect(() => {
// //     socket.emit("get_assigned_quiz", { activitySessionId });

// //     const handler = (res) => {
// //       console.log("📘 assigned quiz:", res);
// //       if (!res) return;
// //       setAssignedQuiz(res);
// //     };

// //     socket.on("assigned_quiz_data", handler);

// //     return () => {
// //       socket.off("assigned_quiz_data", handler);
// //     };
// //   }, [activitySessionId]);
//     // useEffect(() => {
//     //     socket.emit("get_assigned_quiz", { activitySessionId });

//     //     socket.on("assigned_quiz_data", (res) => {
//     //         if (!res.success) return;

//     //         setAssignedQuiz(res.assignedQuiz);
//     //         setQuestions(groupQuestions(res.questions));
//     //     });

//     // return () => socket.off("assigned_quiz_data");
//     // }, [activitySessionId]);

//     // useEffect(() => {
//     //     socket.emit("get_assigned_quiz", { activitySessionId });

//     //     const handler = (res) => {
//     //         if (!res.success) return;
//     //         setAssignedQuiz(res.assignedQuiz);
//     //     };

//     //     socket.on("assigned_quiz_data", handler);

//     // return () => socket.off("assigned_quiz_data", handler);
//     // }, [activitySessionId]);

//     useEffect(() => {
//         socket.emit("get_assigned_quiz", { activitySessionId });

//         const handler = (res) => {
//             if (!res.success) return;

//             setAssignedQuiz(res.assignedQuiz);
//             setQuestions(res.questions);
//         };

//         socket.on("assigned_quiz_data", handler);
//         return () => socket.off("assigned_quiz_data", handler);
//         }, [activitySessionId]);


//   if (!assignedQuiz) {
//     return <p className="text-center mt-20">Loading quiz...</p>;
//   }

//   // 🔥 STEP 1: เลือก UI จาก Quiz_Type
//   switch (assignedQuiz.Quiz_Type) {
//     case "single":
//       return <Activity_quiz_single data={assignedQuiz} />;

//     case "multiple":
//       return <MultiAnsQuizPage data={assignedQuiz} />;

//     case "ordering":
//       return <p className="text-center mt-20">Ordering quiz (ยังไม่ทำ)</p>;

//     default:
//       return <p>Unknown quiz type</p>;
//   }
// }
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { socket } from "../../../../socket";

import Activity_quiz_single from "./Quiz_Single";
import MultiAnsQuizPage from "./Quiz_Multi";
// import Quiz_Ordering from "./Quiz_Ordering";

export default function QuizRoomPage() {
  const { activitySessionId } = useParams();

  const [assignedQuiz, setAssignedQuiz] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);

  /* =========================
     FETCH ASSIGNED QUIZ
     ========================= */
//   useEffect(() => {
//     socket.emit("get_assigned_quiz", { activitySessionId });

//     const handler = (res) => {
//       if (!res.success) return;

//       setAssignedQuiz(res.assignedQuiz);
//       setQuestions(res.questions);
//     };

//     socket.on("assigned_quiz_data", handler);
//     return () => socket.off("assigned_quiz_data", handler);
//   }, [activitySessionId]);
    // useEffect(() => {
    //     socket.emit("get_assigned_quiz", { activitySessionId });

    //     const handler = (res) => {
    //         console.log("📦 assigned_quiz_data:", res);

    //         if (!res.success) return;

    //         setAssignedQuiz(res.assignedQuiz);
    //         setQuestions(res.questions); // 🔥 ขาดบรรทัดนี้
    //     };

    //     console.log("assignedQuiz:", assignedQuiz);
    //     console.log("questions:", questions);

    //     socket.on("assigned_quiz_data", handler);
    // return () => socket.off("assigned_quiz_data", handler);
    // }, [activitySessionId]);
    // useEffect(() => {
    //     socket.emit("get_assigned_quiz", { activitySessionId });

    //     const handler = (res) => {
    //         console.log("📦 assigned_quiz_data:", res);

    //         if (!res.success) return;

    //         setAssignedQuiz(res.assignedQuiz);
    //         setQuestions(groupQuestions(res.questions)); // ⭐⭐ จุดสำคัญ
    //     };

    //     socket.on("assigned_quiz_data", handler);

    //     return () => socket.off("assigned_quiz_data", handler);
    // }, [activitySessionId]);
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


  /* =========================
     LOADING
     ========================= */
  if (!assignedQuiz || questions.length === 0) {
    return <p className="text-center mt-20">Loading quiz...</p>;
  }

//   const currentQuestion = questions[currentIndex];
//     const currentQuestion = questions[currentIndex];

//     if (!currentQuestion) {
//     return <p className="text-center mt-20">Loading quiz...</p>;
//     }

//   /* =========================
//      RENDER BY QUESTION TYPE
//      ========================= */
//   switch (currentQuestion.Question_Type) {
//     case "single":
//       return (
//         // <Activity_quiz_single
//         //   question={currentQuestion}
//         //   current={currentIndex + 1}
//         //   total={questions.length}
//         //   onNext={() => setCurrentIndex((i) => i + 1)}
//         // />
//         <Activity_quiz_single
//             question={currentQuestion}
//             current={currentIndex + 1}
//             total={questions.length}
//             onNext={() => setCurrentIndex(i => i + 1)}
//         />
//       );

//     case "multiple":
//       return (
//         <MultiAnsQuizPage
//           question={currentQuestion}
//           current={currentIndex + 1}
//           total={questions.length}
//           onNext={() => setCurrentIndex((i) => i + 1)}
//         />
//       );

//     case "ordering":
//       return <p className="text-center mt-20">Ordering quiz (ยังไม่ทำ)</p>;

//     default:
//       return <p>Unknown question type</p>;
//   }
const currentQuestion = questions[currentIndex];

if (!currentQuestion) {
  return <p className="text-center mt-20">Loading question...</p>;
}

switch (currentQuestion.Question_Type) {
  case "single":
    return (
      <Activity_quiz_single
        question={currentQuestion}
        current={currentIndex + 1}
        total={questions.length}
        timeLimit={assignedQuiz.Question_Time}
        onNext={() => setCurrentIndex(i => i + 1)}
      />
    );

  case "multiple":
    return (
      <MultiAnsQuizPage
        question={currentQuestion}
        current={currentIndex + 1}
        total={questions.length}
        onNext={() => setCurrentIndex(i => i + 1)}
      />
    );

  default:
    return <p>Ordering quiz (ยังไม่ทำ)</p>;
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
        Image_URL: r.Image_URL,
        choices: [],
      };
    }

    if (r.Option_ID) {
      map[r.Question_ID].choices.push({
        id: r.Option_ID,
        text: r.Option_Text,
        isCorrect: r.Is_Correct,
      });
    }
  });

  return Object.values(map);
}