export function ScoreDistributionChart({
  scores = [],
  step = 1
}) {

  if (!scores.length) {
    return <div className="text-center text-slate-500">No data</div>;
  }

  const maxScore = Math.max(...scores);

  const bins = {};

  for (let start = 0; start <= maxScore; start += step) {
    const end = start + step - 1;
    const label = `${start}-${end}`;
    bins[label] = 0;
  }

  scores.forEach(score => {
    const start = Math.floor(score / step) * step;
    const end = start + step - 1;
    const label = `${start}-${end}`;
    bins[label]++;
  });

  const chartData = Object.entries(bins).map(
    ([label, count]) => ({ label, count })
  );

  const maxCount = Math.max(...chartData.map(c => c.count));

  return (
    <div className="flex items-end gap-2 h-40">

      {chartData.map((b) => {

        const height =
          maxCount > 0
            ? (b.count / maxCount) * 100
            : 0;

        return (
          <div
            key={b.label}
            className="flex-1 flex flex-col items-center"
          >

            <div className="text-xs mb-1">
              {b.count}
            </div>

            <div className="w-full h-28 flex items-end">

              <div
                className="w-full bg-cyan-400 rounded-t"
                style={{ height: `${height}%` }}
              />

            </div>

            <div className="text-xs mt-1">
              {b.label}
            </div>

          </div>
        );

      })}

    </div>
  );
}