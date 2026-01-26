import { useState, useEffect } from "react";
import { Maximize2 } from "lucide-react";

function MultiAnsQuizPage({ question, current, total }) {
  const [currentQuestion] = useState(12); // mock
  const [totalQuestions] = useState(30);  // mock
  const [timer, setTimer] = useState(45); // ตัวนับเวลาเริ่มต้น 45 วินาที       
  const [choices] = useState(["choice 1", "choice 2", "choice 3", "choice 4", "choice 5"]);

  const [selectedChoices, setSelectedChoices] = useState([]); // ⭐ หลายคำตอบ
  const [showImage, setShowImage] = useState(false);

  const toggleChoice = (index) => {
    if (selectedChoices.includes(index)) {
      // ถ้าเลือกไว้แล้ว → เอาออก
      setSelectedChoices(selectedChoices.filter((i) => i !== index));
    } else {
      // ยังไม่ถูกเลือก → เพิ่มเข้า array
      setSelectedChoices([...selectedChoices, index]);
    }
  };

  // ใช้ useEffect สำหรับนับถอยหลัง
  useEffect(() => {
    if (timer <= 0) return; // ถ้าเวลาถึง 0 หยุด interval

    const interval = setInterval(() => {
      setTimer((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(interval); // ล้าง interval เมื่อ component unmount
  }, [timer]);

  // return (
  //   <div className="w-full min-h-screen bg-white flex flex-col items-center py-6 pt-[80px]">


  //     {/* Progress Box */}
  //     <div className="bg-gray-300 px-6 py-2 rounded-xl shadow mb-6 self-end">
  //       <p className="font-medium">
  //         Now Question {currentQuestion}/{totalQuestions}
  //       </p>
  //     </div>

  //     {/* Question */}
  //     <div className="w-11/12 bg-gray-300 py-10 text-center font-semibold text-xl rounded-lg mb-4">
  //       question ในปี พ.ศ. 2566 ประเทศไทยได้มีการปรับปรุงกฎหมายด้านสิ่งแวดล้อมหลายฉบับเพื่อส่งเสริมการลดการใช้พลาสติก แต่ผลกระทบต่อเศรษฐกิจในภาคอุตสาหกรรมจะเป็นอย่างไร?
  //     </div>

  //     {/* Picture Box */}
  //     <div className="w-[300px] h-[300px] bg-gray-300 flex items-center justify-center rounded-lg mb-4 relative">
  //       <img
  //         src="/assets/question.png"
  //         className="w-full h-full object-contain"
  //         alt="question"
  //       />

  //       {/* ปุ่มขยาย */}
  //       <button
  //         onClick={() => setShowImage(true)}
  //         className="bg-black text-white px-3 py-1 rounded-lg absolute bottom-2 right-2 opacity-80 hover:opacity-100"
  //       >
  //         <Maximize2 className="text-white w-5 h-5" />
  //       </button>
  //     </div>

  //     {/* Choose text */}
  //     <p className="text-gray-700 mb-3">select all correct choices</p>

  //     {/* Choices */}
  //     <div className="w-11/12 space-y-3">
  //       {choices.map((c, idx) => {
  //         const isSelected = selectedChoices.includes(idx);
  //         return (
  //           <button
  //             key={idx}
  //             onClick={() => toggleChoice(idx)}
  //             className={`w-full py-4 text-center rounded-2xl font-medium border transition ${
  //               isSelected
  //                 ? "bg-green-300 border-green-600 scale-[1.02]"
  //                 : "bg-gray-300 hover:bg-gray-400"
  //             }`}
  //           >
  //             {c}
  //           </button>
  //         );
  //       })}
  //     </div>

  //     {/* Footer */}
  //     <div className="w-11/12 flex justify-between items-center mt-10">
  //       <div className="flex flex-col items-center">
  //         <div
  //           className={`w-20 h-20 rounded-full flex items-center justify-center text-3xl font-bold ${
  //             timer <= 5 ? "bg-red-400 text-white" : "bg-gray-300"
  //           }`}
  //         >
  //           {timer}s
  //         </div>
  //       </div>

  //       {/* ถ้าจะส่ง selectedChoices ไป backend */}
  //       <button
  //         onClick={() => console.log("ส่งคำตอบ: ", selectedChoices)}
  //         className={`bg-gray-400 text-white px-10 py-3 rounded-2xl text-lg hover:bg-gray-500 ${
  //           timer <= 0 ? "opacity-50 cursor-not-allowed" : ""
  //         }`}
  //         disabled={timer <= 0}
  //       >
  //         Next
  //       </button>
  //     </div>

  //     {/* Fullscreen Image Modal */}
  //     {showImage && (
  //       <div
  //         className="fixed inset-0 bg-black bg-opacity-80 z-50 flex items-center justify-center"
  //         onClick={() => setShowImage(false)}
  //       >
  //         <img
  //           src="/assets/question.png"
  //           className="max-w-[90%] max-h-[90%] object-contain rounded-lg"
  //           alt="full"
  //         />
  //       </div>
  //     )}
  //   </div>
  // );
  return (
    <>
      <p>Now Question {current}/{total}</p>
      <div>{question.Question_Text}</div>

      {question.choices.map((c, idx) => (
        <button key={c.id}>
          {c.text}
        </button>
      ))}
    </>
  );
}

export default MultiAnsQuizPage;
