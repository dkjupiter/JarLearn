// single

function calculateSingleScore({ isCorrect, timeSpent, maxTime }) {
  const bonus = Math.max(0, Math.floor((maxTime - timeSpent) * 2));
  if (!isCorrect) return 0;
  return 100 + bonus;
}

// multiple (soft penalty)
function calculateMultipleScore({
  correctCount,
  wrongCount,
  maxTime,
  timeSpent
}) {
  const bonus = Math.max(0, Math.floor((maxTime - timeSpent) * 2));
  if (correctCount === 0) return 0;
  if (wrongCount === 0) return 100 + bonus;
}

// ordering
function calculateOrderingScore({
  correctOrder,
  studentOrder,
  maxTime,
  timeSpent,
}) {
  const bonus = Math.max(0, Math.floor((maxTime - timeSpent) * 2));
  correctOrder.forEach((id, index) => {
    if (studentOrder[index] != id) return 0;
  });

  return 100+bonus;
}

module.exports = {
  calculateSingleScore,
  calculateMultipleScore,
  calculateOrderingScore,
};