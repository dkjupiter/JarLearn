import { useNavigate } from "react-router-dom";
import Sidebar_guest from "../Sidebar_guest";

export default function Myclass_guest() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col">
      <Sidebar_guest />

      <main
        className="flex flex-col flex-1 p-6"
        style={{
        //   backgroundImage:
        //     "url(\"data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' width='60' height='60'><text y='50%' x='50%' dominant-baseline='middle' text-anchor='middle' font-size='40'>🥕</text></svg>\")",
        //   backgroundRepeat: "repeat",
        //   backgroundSize: "60px",
          backgroundColor: "#eae8e8ff"
        }}
      >
        <div className="flex flex-col items-center justify-center flex-1 bg-white/0 backdrop-blur-md p-10 rounded-2xl shadow-xl">
          <h2 className="text-2xl font-bold mb-4 text-orange-600">
            You are not signed in
          </h2>

          <p className="mb-6 text-gray-700 text-center">
            Only signed-in teachers can create classes.
          </p>

          <button
            onClick={() => navigate("/app")}
            className="w-72 py-3 mb-4 bg-orange-500 text-white rounded-md hover:bg-orange-600 transition"
          >
            Sign in
          </button>

          <button
            onClick={() => navigate("/register")}
            className="w-72 py-3 bg-white border border-orange-400 text-orange-600 rounded-md hover:bg-orange-100 transition"
          >
            No account? Register!
          </button>
        </div>
      </main>
    </div>
  );
}
