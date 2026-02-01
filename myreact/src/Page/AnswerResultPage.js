import { useEffect, useState } from "react";
// import Navbar from "../Navbar";
import { Crown } from "lucide-react";

function AnswerResultPage() {
  // mock data
  const isCorrect = true; // true = ถูก, false = ผิด
  const pointForThis = 87;

  const currentPoint = 120;         // คะแนนก่อนตอบ
  const newPoint = isCorrect ? currentPoint + pointForThis : currentPoint;

  const [displayPoint, setDisplayPoint] = useState(currentPoint);

  useEffect(() => {
    if (!isCorrect) {
      // ❌ ผิด → ไม่ต้องวิ่ง
      setDisplayPoint(currentPoint);
      return;
    }

    // ✔ ถูก → ให้ตัวเลขวิ่งจาก currentPoint → newPoint
    let start = currentPoint;
    const end = newPoint;
    const duration = 800; 
    const increment = Math.ceil(pointForThis / (duration / 16)); 

    const counter = setInterval(() => {
      start += increment;
      if (start >= end) {
        start = end;
        clearInterval(counter);
      }
      setDisplayPoint(start);
    }, 16);

    return () => clearInterval(counter);
  }, [isCorrect, pointForThis, currentPoint, newPoint]);


  return (
    <div className="w-full min-h-screen bg-white flex flex-col items-center pt-[80px]">
      {/* <Navbar /> */}

      <h1 className="text-3xl font-bold mt-6">Answer</h1>

      {/* Circle with effect */}
      <div
        className={`
          w-[220px] h-[220px] rounded-full mt-4 flex items-center justify-center relative
          transition-all duration-300
          ${
            isCorrect
              ? "bg-green-400 shadow-[0_0_25px_6px_rgba(0,255,0,0.5)] animate-shake"
              : "bg-red-400 animate-shake"
          }
        `}
      >
        <p className="text-5xl font-bold">{isCorrect ? "✔" : "✖"}</p>
      </div>

      {/* Point */}
      <h2 className="text-3xl font-bold mt-10">Point</h2>
      <p className="text-xl mt-2">
        correct answer : <span className="font-bold">{pointForThis}</span>
      </p>

      {/* Current point */}
      <h2 className="text-3xl font-bold mt-10">current point</h2>
      <p className="text-4xl mt-1 font-semibold transition-all duration-500">
        {displayPoint}
      </p>

      {/* Avatar + bouncing crown */}
      <div className="w-[220px] h-[220px] bg-gray-300 rounded-full mt-10 flex items-center justify-center relative">
        <Crown className="w-14 h-14 absolute -top-6 left-6 text-black animate-bounce" />
      </div>

      <p className="text-xl mt-4">Aka</p>

      <h2 className="text-3xl font-bold mt-6">rank</h2>
      <div className="flex items-center gap-2 mt-1">
        <Crown className="w-6 h-6" />
        <p className="text-xl font-medium">on podium</p>
      </div>

      <button className="
        mt-10 bg-gray-800 text-white px-14 py-3 rounded-2xl text-lg
        hover:bg-black transition-all duration-300 active:scale-95
      ">
        Next
      </button>
    </div>
  );
}

export default AnswerResultPage;
