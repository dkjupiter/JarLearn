// import { useEffect, useState } from "react";
// import Navbar from "../Navbar";
// import { Maximize2 } from "lucide-react";
// import { socket } from "../socket";

// function OneAnsQuizPage({
//   question,
//   timeLimit,
//   isQuizTimer,
//   currentQuestion,
//   totalQuestions,
//   onSubmit,
// }) {
//   const [selectedChoice, setSelectedChoice] = useState(null);
//   const [timer, setTimer] = useState(() =>
//     Number.isFinite(timeLimit) ? timeLimit : null
//   );


//   const [locked, setLocked] = useState(false);
//   const [showImage, setShowImage] = useState(false);
//   const [startTime, setStartTime] = useState(Date.now());


//   /* ⏱ reset เมื่อเปลี่ยนข้อ (เฉพาะที่ไม่ใช่ quiztimer)*/
//   useEffect(() => {
//     if (isQuizTimer) return;   // ❗ ห้าม reset
//     //  if (typeof timeLimit !== "number" || Number.isNaN(timeLimit)) return;
//     setTimer(timeLimit);
//     setLocked(false);
//     setSelectedChoice(null);
//     setStartTime(Date.now());
//   }, [question.Question_ID]);

//   //countdown (เฉพาะที่ไม่ใช่ quiztimer)
//   useEffect(() => {
//     if (isQuizTimer) return;
//     if (locked) return;
//     if (!Number.isFinite(timer)) return;

//     if (timer <= 0) {
//       autoSubmit();
//       return;
//     }

//     const i = setInterval(() => {
//       setTimer(t => (Number.isFinite(t) ? t - 1 : 0));
//     }, 1000);

//     return () => clearInterval(i);
//   }, [timer, locked, isQuizTimer]);

//   //sync Quiz Timer (แสดงอย่างเดียว)
//   useEffect(() => {
//     if (!isQuizTimer) return;
//     if (!Number.isFinite(timeLimit)) return;

//     setTimer(timeLimit);
//   }, [timeLimit, isQuizTimer]);



//   /* 👩‍🏫 ครู force submit */
//   useEffect(() => {
//     socket.on("force_submit", autoSubmit);
//     return () => socket.off("force_submit", autoSubmit);
//   }, [locked, selectedChoice]);

//   const autoSubmit = () => {
//     if (locked) return;
//     setLocked(true);

//     const timeSpent = Math.floor((Date.now() - startTime) / 1000);
//     onSubmit(
//       selectedChoice !== null ? [selectedChoice] : [],
//       timeSpent
//     );
//   };

//   const formatTime = (seconds) => {
//     if (!Number.isFinite(seconds)) return "";

//     const m = Math.floor(seconds / 60);
//     const s = seconds % 60;

//     return `${m}:${s.toString().padStart(2, "0")}`;
//   };



//   return (
//     <div className="w-full min-h-screen bg-white flex flex-col items-center pt-[80px]">
//       <Navbar />

//       <div className="bg-gray-300 px-6 py-2 rounded-xl self-end">
//         Now Question {currentQuestion}/{totalQuestions}
//       </div>

//       <div className="w-11/12 bg-gray-300 py-10 text-center text-xl rounded-lg mt-4">
//         {question.Question_Text}
//       </div>

//       {/* Choose text */}
//       <p className="text-gray-700 mb-3">choose 1 choice</p>

//       {question.Question_Image && (
//         <div className="w-[300px] h-[300px] bg-gray-300 mt-4 relative rounded-lg">
//           <img
//             src={question.Question_Image}
//             className="w-full h-full object-contain"
//             alt=""
//           />
//           <button
//             onClick={() => setShowImage(true)}
//             className="absolute bottom-2 right-2 bg-black text-white p-1 rounded"
//           >
//             <Maximize2 />
//           </button>
//         </div>
//       )}

//       <div className="w-11/12 space-y-3 mt-6">
//         {question.choices.map((c) => (
//           <button
//             key={c.Option_ID}
//             // onClick={() => setSelectedChoice(c.Option_ID)}
//             onClick={() => {
//               if (locked) return;

//               setSelectedChoice(c.Option_ID);

//               const timeSpent = Math.floor((Date.now() - startTime) / 1000);
//               setLocked(true);

//               onSubmit([c.Option_ID], timeSpent);
//             }}

//             className={`w-full py-4 rounded-2xl ${selectedChoice === c.Option_ID
//                 ? "bg-gray-500 text-white"
//                 : "bg-gray-300"
//               }`}
//           >
//             {c.Option_Text}
//           </button>
//         ))}
//       </div>

//       <div className="w-11/12 grid grid-cols-3 items-center mt-10">
  
//         {/* ซ้าย */}
//         <div>
//           {Number.isFinite(timer) && (
//             <div className="w-20 h-20 rounded-full bg-gray-300 flex items-center justify-center text-3xl">
//               {formatTime(timer)}
//             </div>
//           )}
//         </div>

//         {/* กลาง (เว้นที่ไว้เสมอ) */}
//         <div></div>

//         {/* ขวา */}
//         {/* <div className="flex justify-end">
//           <button
//             disabled={locked || selectedChoice === null}
//             onClick={autoSubmit}
//             className="w-72 bg-gray-600 text-white px-10 py-3 rounded-2xl disabled:opacity-50"
//           >
//             Next
//           </button>
//         </div> */}

//       </div>


//       {showImage && (
//         <div
//           className="fixed inset-0 bg-black/80 flex items-center justify-center"
//           onClick={() => setShowImage(false)}
//         >
//           <img
//             src={question.Question_Image}
//             className="max-w-[90%] max-h-[90%]"
//             alt=""
//           />
//         </div>
//       )}
//     </div>
//   );
// }

// export default OneAnsQuizPage;

import { useEffect, useState, useRef } from "react";
import Navbar from "../Navbar";
import { Maximize2 , Clock} from "lucide-react";
import { socket } from "../../socket";

function OneAnsQuizPage({
  question,
  timeLimit,
  isQuizTimer,
  currentQuestion,
  totalQuestions,
  onSubmit,
}) {
  const [selectedChoice, setSelectedChoice] = useState(null);
  const [timer, setTimer] = useState(
    Number.isFinite(timeLimit) ? timeLimit : null
  );

  const [locked, setLocked] = useState(false);
  const [showImage, setShowImage] = useState(false);

  const startTimeRef = useRef(null);

  /* ================= RESET เมื่อเปลี่ยนข้อ ================= */
  useEffect(() => {
    if (isQuizTimer) return;
    if (!Number.isFinite(timeLimit)) return;

    setLocked(false);
    setSelectedChoice(null);

    const key = `start_${question.Question_ID}`;
    const savedStart = localStorage.getItem(key);

    if (savedStart) {
      const elapsed =
        Math.floor((Date.now() - Number(savedStart)) / 1000);

      // 🔥 ถ้าเวลาผ่านเกิน limit แล้ว → ถือว่าเป็นค่าค้าง
      if (elapsed >= timeLimit) {
        const now = Date.now();
        startTimeRef.current = now;
        localStorage.setItem(key, now);
      } else {
        startTimeRef.current = Number(savedStart);
      }

    } else {
      const now = Date.now();
      startTimeRef.current = now;
      localStorage.setItem(key, now);
    }


  }, [question.Question_ID, timeLimit, isQuizTimer]);

  /* ================= TIMER ================= */
  useEffect(() => {
    if (isQuizTimer) return;
    if (!Number.isFinite(timeLimit)) return;
    if (!startTimeRef.current) return;
    if (locked) return;

    const updateTimer = () => {
      const elapsed =
        Math.floor((Date.now() - startTimeRef.current) / 1000);

      const remaining = timeLimit - elapsed;

      if (remaining <= 0) {
        setTimer(0);
        autoSubmit();
      } else {
        setTimer(remaining);
      }
    };

    updateTimer(); // 🔥 สำคัญมาก → คำนวณทันทีตอน mount

    const interval = setInterval(updateTimer, 1000);

    return () => clearInterval(interval);

  }, [question.Question_ID, locked, timeLimit, isQuizTimer]);

  /* ================= QUIZ TIMER (server sync) ================= */
  useEffect(() => {
    if (!isQuizTimer) return;
    if (!Number.isFinite(timeLimit)) return;

    setTimer(timeLimit);
  }, [timeLimit, isQuizTimer]);

  /* ================= ครู force submit ================= */
  useEffect(() => {
    socket.on("force_submit", autoSubmit);
    return () => socket.off("force_submit", autoSubmit);
  }, [locked, selectedChoice]);

  const autoSubmit = () => {
    if (locked) return;
    setLocked(true);

    localStorage.removeItem(`start_${question.Question_ID}`);

    const timeSpent = startTimeRef.current
      ? Math.floor((Date.now() - startTimeRef.current) / 1000)
      : 0;

    onSubmit(
      selectedChoice !== null ? [selectedChoice] : [],
      timeSpent
    );
  };

  const formatTime = (seconds) => {
    if (!Number.isFinite(seconds)) return "";
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, "0")}`;
  };

  console.log("QUESTION IMAGE =", question.Question_Image);
  return (
    <div className="w-full min-h-screen bg-slate-900 text-slate-100 flex flex-col items-center py-6">
      <Navbar />

      {/* Progress */}
      <p className="mt-16 mb-4 text-slate-400 font-medium">
        Now Question {currentQuestion}/{totalQuestions}
      </p>

      {/* Question */}
      <div className="w-11/12 max-w-3xl bg-slate-800 border border-slate-700 p-6 rounded-2xl text-center text-xl font-semibold mb-4">
        {question.Question_Text}
      </div>

      {/* Instruction */}
      <p className="text-cyan-300 mb-3 font-medium">
        Choose 1 choice
      </p>

      {/* Image */}
      {question.Question_Image && (
        <div className="w-[220px] h-[220px] bg-slate-800 border border-slate-700 rounded-xl mb-4 relative">
          <img
            src={question.Question_Image}
            className="w-full h-full object-contain"
            alt=""
          />
          <button
            onClick={() => setShowImage(true)}
            className="absolute bottom-2 right-2 bg-slate-900 text-slate-100 px-3 py-1 rounded-lg"
          >
            <Maximize2 />
          </button>
        </div>
      )}

      {/* Choices */}
      <div className="w-11/12 max-w-3xl space-y-3 mt-4">
        {(question.choices || []).map((c) => (
          <button
            key={c.Option_ID}
            onClick={() => {
              if (locked) return;

              setSelectedChoice(c.Option_ID);
              setLocked(true);

              const timeSpent = startTimeRef.current
                ? Math.floor((Date.now() - startTimeRef.current) / 1000)
                : 0;

              localStorage.removeItem(`start_${question.Question_ID}`);

              onSubmit([c.Option_ID], timeSpent);
            }}
            className={`w-full py-4 rounded-xl font-medium transition
            ${
              selectedChoice === c.Option_ID
                ? "bg-cyan-500 text-slate-900"
                : "bg-slate-800 border border-slate-700 hover:bg-slate-700"
            }`}
          >
            {c.Option_Text}
          </button>
        ))}
      </div>

      {/* Footer */}
      <div className="mt-8 w-11/12 max-w-3xl flex items-center justify-between">

        {/* Timer */}
        {Number.isFinite(timer) && (
          <div
            className={`px-4 py-2 rounded-full font-semibold  flex items-center gap-2
            ${
              timer <= 5
                ? "bg-red-500 text-white"
                : "bg-cyan-700 text-slate-100"
            }`}
          >
            <Clock size={18} />
            <span>{formatTime(timer)}s</span>
          </div>
        )}

      </div>

      {/* Full image */}
      {showImage && (
        <div
          className="fixed inset-0 bg-black/80 flex items-center justify-center"
          onClick={() => setShowImage(false)}
        >
          <img
            src={question.Question_Image}
            className="max-w-[90%] max-h-[90%]"
            alt=""
          />
        </div>
      )}
    </div>
  );
}

export default OneAnsQuizPage;
