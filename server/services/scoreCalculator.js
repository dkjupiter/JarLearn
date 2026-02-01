// single
function calculateSingleScore({ isCorrect, timeSpent, maxTime }) {
  if (!isCorrect) return 0;

  const bonus = Math.max(0, Math.floor((maxTime - timeSpent) * 2));
  return 100 + bonus;
}

// multiple (soft penalty)
function calculateMultipleScore({
  correctCount,
  wrongCount,
  totalCorrect,
  penalty = 0.5,
}) {
  const raw =
    (correctCount - wrongCount * penalty) / totalCorrect;

  return Math.max(0, Math.round(raw * 100));
}

// ordering
function calculateOrderingScore({
  correctOrder,
  studentOrder,
}) {
  let correctPos = 0;

  correctOrder.forEach((id, index) => {
    if (studentOrder[index] === id) correctPos++;
  });

  return Math.round(
    (correctPos / correctOrder.length) * 100
  );
}

module.exports = {
  calculateSingleScore,
  calculateMultipleScore,
  calculateOrderingScore,
};
