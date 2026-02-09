import { socket } from "../../../socket";

function StudentQuizPage({
  activitySessionId,
  quizId,
  questions,
  studentId
}) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedChoices, setSelectedChoices] = useState([]);

  const currentQuestion = questions[currentIndex];

  const handleSubmitAnswer = () => {
    socket.emit("submit_answer", {
      activitySessionId,
      quizId,
      questionId: currentQuestion.Question_ID,
      studentId,
      choiceIds: selectedChoices,
      timeSpent: 5,
      currentQuestionIndex: currentIndex + 1, // 🔥 สำคัญ
      totalQuestions: questions.length        // 🔥 สำคัญ
    });

    setSelectedChoices([]);
    setCurrentIndex((i) => i + 1);
  };

  return (
    <>
      <h2>{currentQuestion.Question_Text}</h2>

      {/* render choices */}
      {currentQuestion.options.map((o) => (
        <button
          key={o.Option_ID}
          onClick={() => setSelectedChoices([o.Option_ID])}
        >
          {o.Option_Text}
        </button>
      ))}

      <button onClick={handleSubmitAnswer}>
        Submit
      </button>
    </>
  );
}
