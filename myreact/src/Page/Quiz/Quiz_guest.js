import { useNavigate } from "react-router-dom";
import Sidebar_guest from "../Sidebar_guest";

export default function Quiz_guest() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col bg-slate-900">
      <Sidebar_guest />

      <main className="flex flex-col flex-1 p-6 items-center justify-center">
        {/* Card */}
        <div className="w-full max-w-md bg-slate-800 border border-slate-700 
                        rounded-2xl p-10 shadow-2xl text-center">
          
          <h2 className="text-2xl font-bold mb-4 text-cyan-300">
            You are not signed in
          </h2>

          <p className="mb-6 text-slate-300">
            Only signed-in teachers can manage quizzes.
          </p>

          {/* Sign in */}
          <button
            onClick={() => navigate("/teacher")}
            className="w-full py-3 mb-3 rounded-lg
                       bg-cyan-400 text-slate-900 font-semibold
                       hover:bg-cyan-300 hover:scale-[1.02]
                       shadow-lg shadow-cyan-400/30
                       transition"
          >
            Sign in
          </button>

          {/* Register */}
          <button
            onClick={() => navigate("/register")}
            className="w-full py-3 rounded-lg
                       border border-slate-600 text-slate-300
                       hover:bg-slate-700 hover:text-white
                       transition"
          >
            No account? Register
          </button>
        </div>
      </main>
    </div>
  );
}