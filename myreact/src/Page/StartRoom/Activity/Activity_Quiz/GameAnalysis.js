// import Navbar from "../Navbar";

function GameAnalysis() {

  const questions = [
    {
      question: "ข้อใดคือสาเหตุสำคัญที่ทำให้เกิดภาวะโลกร้อนในปัจจุบัน?",
      correctIndex: 0,
      choices: [
        { text: "การปล่อยก๊าซเรือนกระจกจากอุตสาหกรรม", percent: 55 },
        { text: "การเพิ่มขึ้นของจำนวนป่าไม้", percent: 5 },
        { text: "การใช้พลังงานทดแทนมากเกินไป", percent: 20 },
        { text: "การหมุนของโลกผิดปกติ", percent: 20 },
      ],
      time: 14,
    },
    {
      question: "เหตุผลใดที่ทำให้หลายประเทศเริ่มหันมาใช้พลังงานสะอาดมากขึ้น?",
      correctIndex: 1,
      choices: [
        { text: "ต้นทุนการผลิตสูงขึ้น", percent: 12 },
        { text: "ต้องการลดผลกระทบต่อสิ่งแวดล้อม", percent: 72 },
        { text: "เพราะพลังงานฟอสซิลหมดไปแล้วทั้งหมด", percent: 16 },
      ],
      time: 11,
    },
    {
      question: "การรีไซเคิลมีผลดีอย่างไรต่อเศรษฐกิจในระยะยาว?",
      correctIndex: 0,
      choices: [
        { text: "ลดค่าใช้จ่ายด้านการจัดการขยะ", percent: 65 },
        { text: "เพิ่มการใช้ทรัพยากรใหม่", percent: 10 },
        { text: "ทำให้ราคาน้ำมันสูงขึ้น", percent: 5 },
        { text: "ไม่มีผลต่อเศรษฐกิจ", percent: 20 },
      ],
      time: 13,
    },
  ];

  return (
    <div className="w-full min-h-screen bg-white flex flex-col pt-[80px] items-center relative">

      {/* <Navbar /> */}

      <h1 className="text-3xl font-bold mb-4 mt-4">วิเคราะห์เกม</h1>

      <div className="w-11/12 border border-black rounded-2xl p-5 max-h-[65vh] overflow-y-auto">

        {questions.map((q, qIndex) => (
          <div key={qIndex} className="mb-10">

            <div className="bg-gray-300 p-4 rounded-xl text-center text-xl font-medium mb-4">
              {q.question}
            </div>

            {q.choices.map((c, i) => {
              const isCorrect = i === q.correctIndex;

              return (
                <div
                  key={i}
                  className="relative bg-gray-200 rounded-xl p-2 mb-3 flex items-center justify-between overflow-hidden"
                >

                  {/* === แถบเปอร์เซ็นต์ด้านหลัง === */}
                  <div
                    className={`absolute left-0 top-0 h-full rounded-xl transition-all duration-500
                      ${isCorrect ? "bg-green-600" : "bg-gray-500"}
                    `}
                    style={{ width: `${c.percent}%` }}
                  />

                  {/* เนื้อหาตัวเลือก */}
                  <div className="relative flex justify-between items-center w-full px-2">
                    <span className="font-medium text-black">{c.text}</span>
                    <span className="font-medium text-lg">{c.percent}%</span>
                  </div>
                </div>
              );
            })}

            <p className="text-center mt-3 text-gray-600">
              time : {q.time} sec
            </p>
          </div>
        ))}

      </div>

      <div className="w-full flex justify-center py-6 bg-white">
        <button className="bg-gray-600 text-white w-10/12 py-4 rounded-2xl text-lg hover:bg-gray-400">
          Back
        </button>
      </div>
    </div>
  );
}

export default GameAnalysis;
