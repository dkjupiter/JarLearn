function ScoreDistributionChart({ students = [] }) {
  if (!students.length) {
    return (
      <div className="text-center text-gray-500">
        No data
      </div>
    );
  }

  const maxScore = Math.max(
    ...students.map((s) => s.total_score)
  );

  return (
    <div className="flex items-end gap-2 h-32">
      {students.map((s) => {
        const height =
          maxScore > 0
            ? (s.total_score / maxScore) * 100
            : 0;

        return (
          <div key={s.Student_ID} className="flex-1">
            <div className="h-28 flex items-end">
              <div
                className="w-full bg-gray-600 rounded-t"
                style={{ height: `${height}%` }}
                title={`${s.name}: ${s.total_score}`}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default ScoreDistributionChart;
