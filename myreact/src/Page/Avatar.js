import { useState } from "react";
import Sidebar from "./Sidebar_guest";

const headOptions = [
  "Head1", "Head2", "Head3", "Head4", "Head5"
];

const bodyOptions = [
  "Body1", "Body2", "Body3", "Body4", "Body5", "Body6", "Body7", "Body8", "Body9"
];

export default function Avatar() {
  const [selectedHead, setSelectedHead] = useState(headOptions[0]);
  const [selectedBody, setSelectedBody] = useState(bodyOptions[0]);

  return (
    <div className="min-h-screen bg-white flex flex-col">
          {/* เรียก Navbar */}
          <Sidebar />

                {/* Main Content */}
      <main className="flex flex-col flex-1 p-2 mt-14">
        {/* <h2 className="text-2xl font-bold mb-6">Avatar</h2> */}

      {/* Avatar */}
      <div className="flex flex-col items-center mt-6">
        <div className="w-32 h-32 rounded-full bg-gray-400 flex items-center justify-center text-white text-xl">
          {selectedHead}
        </div>

        {/* Head Options */}
        <div className="flex gap-2 mt-4">
          {headOptions.map((head) => (
            <div
              key={head}
              onClick={() => setSelectedHead(head)}
              className={`w-12 h-12 rounded-full flex items-center justify-center cursor-pointer
                ${selectedHead === head ? "border-2 border-blue-500" : "bg-gray-300"}`}
            >
              {head}
            </div>
          ))}
        </div>

        {/* Body Options */}
        <div className="grid grid-cols-3 gap-3 mt-6 border p-4 rounded-lg">
          {bodyOptions.map((body) => (
            <div
              key={body}
              onClick={() => setSelectedBody(body)}
              className={`w-20 h-20 rounded-full flex items-center justify-center cursor-pointer
                ${selectedBody === body ? "border-2 border-blue-500" : "bg-gray-300"}`}
            >
              {body}
            </div>
          ))}
        </div>
      </div>

      {/* Buttons */}
      <button
            className="fixed bottom-10 w-72 py-3 mb-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition self-center"
            >
            Finish
        </button>
        </main>
    </div>
  );
}
