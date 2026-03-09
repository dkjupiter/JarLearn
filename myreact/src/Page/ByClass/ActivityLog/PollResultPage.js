import React, { useEffect, useState } from "react";
import { socket } from "../../../socket";

export default function PollResultPage({ poll }) {

  const [results, setResults] = useState([]);

  useEffect(() => {

    if (!poll?.AssignedPoll_ID) return;

    socket.emit("get_poll_result", {
      assignedPollId: poll.AssignedPoll_ID
    });

    const handler = (data) => {
      setResults(data);
    };

    socket.on("poll_result_data", handler);

    return () =>
      socket.off("poll_result_data", handler);

  }, [poll]);


  return (
    <div className="max-w-md mx-auto h-full flex items-center justify-center px-4">

      <div className="w-full space-y-6">


        <h1 className="text-2xl font-bold text-center text-slate-100">
          {poll?.Poll_Question}
        </h1>

        <div className="space-y-4">

          {results.map((r, i) => (
            <div
              key={i}
              className="relative bg-slate-800 rounded-xl h-12 overflow-hidden"
            >

              <div
                className="absolute left-0 top-0 h-full bg-cyan-400/70"
                style={{ width: `${r.percent}%` }}
              />

              <div className="relative z-10 flex justify-between items-center h-full px-4 text-slate-100">

                <span>{r.text}</span>

                <span>{r.percent}%</span>

              </div>

            </div>
          ))}

        </div>

      </div>

    </div>
  );
}