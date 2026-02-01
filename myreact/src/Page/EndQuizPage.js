// import Navbar from "../Navbar";

function EndQuizPage() {
  const playerName = "Aka";
  const finalScore = 999;
  const finalRank = 10;

  return (
    <div className="w-full min-h-screen bg-white flex flex-col items-center pt-[80px]">
      {/* <Navbar /> */}

      {/* Title */}
      <h1 className="text-3xl font-bold mt-4">Your Ranking</h1>

      {/* Profile Circle */}
      <div className="w-48 h-48 bg-gray-300 rounded-full mt-8"></div>

      {/* Name */}
      <p className="text-xl font-medium mt-4">{playerName}</p>

      {/* Final score */}
      <p className="text-lg font-medium mt-6">Your final score :</p>
      <p className="text-4xl font-bold">{finalScore}</p>

      {/* Final rank */}
      <p className="text-lg font-medium mt-6">Your final rank :</p>
      <p className="text-4xl font-bold">{finalRank}</p>
      
    </div>
  );
}

export default EndQuizPage;
