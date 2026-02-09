// function ScoreDistributionChart({ students = [] }) {
//   if (!students.length) {
//     return <div className="text-center text-gray-500">No data</div>;
//   }

//   // 🔥 รวมคะแนนต่อคน
//   const byStudent = {};
//   for (const s of students) {
//     if (!byStudent[s.Student_ID]) {
//       byStudent[s.Student_ID] = {
//         Student_ID: s.Student_ID,
//         name: s.name ?? s.Student_Name,
//         total_score: 0,
//       };
//     }
//     byStudent[s.Student_ID].total_score += s.total_score ?? s.Total_Score ?? 0;
//   }

//   const chartData = Object.values(byStudent);

//   const maxScore = Math.max(
//     ...chartData.map((s) => s.total_score)
//   );

//   return (
//     <div className="flex items-end gap-2 h-32">
//       {chartData.map((s) => {
//         const height =
//           maxScore > 0
//             ? (s.total_score / maxScore) * 100
//             : 0;

//         return (
//           <div key={s.Student_ID} className="flex-1">
//             <div className="h-28 flex items-end">
//               <div
//                 className="w-full bg-gray-600 rounded-t"
//                 style={{ height: `${height}%` }}
//                 title={`${s.name}: ${s.total_score}`}
//               />
//             </div>
//           </div>
//         );
//       })}
//     </div>
//   );
// }


// export default ScoreDistributionChart;
function ScoreRangeDistributionChart({
  students = [],
  step = 100, // ขนาดช่วงคะแนน (เช่น 100 คะแนน)
}) {
  if (!students.length) {
    return <div className="text-center text-gray-500">No data</div>;
  }

  // 🔢 ดึงคะแนนทั้งหมด
  const scores = students.map(
    (s) => s.Total_Score ?? s.total_score ?? 0
  );

  const maxScore = Math.max(...scores);

  // 🧱 สร้างช่วงคะแนน
  const bins = {};
  for (let start = 0; start <= maxScore; start += step) {
    const end = start + step - 1;
    const label = `${start}–${end}`;
    bins[label] = 0;
  }

  // 📊 นับจำนวนคนต่อช่วง
  for (const score of scores) {
    const start = Math.floor(score / step) * step;
    const end = start + step - 1;
    const label = `${start}–${end}`;
    bins[label]++;
  }

  const chartData = Object.entries(bins).map(
    ([label, count]) => ({ label, count })
  );

  const maxCount = Math.max(...chartData.map((b) => b.count));

  return (
    <div className="flex items-end gap-3 h-40">
      {chartData.map((b) => {
        const height =
          maxCount > 0 ? (b.count / maxCount) * 100 : 0;

        return (
          <div
            key={b.label}
            className="flex-1 flex flex-col items-center"
          >
            {/* 🔢 จำนวน */}
            <div className="text-xs mb-1 text-gray-700">
              {b.count}
            </div>

            {/* 🟦 Bar */}
            <div className="w-full h-28 flex items-end">
              <div
                className="w-full bg-gray-600 rounded-t"
                style={{ height: `${height}%` }}
                title={`${b.label} : ${b.count} คน`}
              />
            </div>

            {/* 🏷️ Label */}
            <div className="mt-1 text-xs text-gray-600">
              {b.label}
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default ScoreRangeDistributionChart;
