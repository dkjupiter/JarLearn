import React, { useState, useEffect } from "react";
import PollResultPage from "./PollResultPage";
import { socket } from "../../../socket";
import { formatSmartDate } from "../../../utils/date";

export default function PollTab({
  classId,
  onReportChange,
  requestBack,
  onBackHandled,
}) {

  const [page, setPage] = useState("list");
  const [polls, setPolls] = useState([]);
  const [selectedPoll, setSelectedPoll] = useState(null);

  useEffect(() => {
    onReportChange?.(page !== "list");
  }, [page]);

  useEffect(() => {
    if (!requestBack) return;

    if (page === "result") {
      setPage("list");
    }

    onBackHandled?.();
  }, [requestBack]);


  /* fetch poll logs */

  useEffect(() => {

    if (!classId) return;

    socket.emit("get_poll_logs", { classId });

    const handler = (data) => {
      setPolls(data);
    };

    socket.on("poll_logs_data", handler);

    return () => socket.off("poll_logs_data", handler);

  }, [classId]);


  if (page === "result") {
    return (
      <PollResultPage
        poll={selectedPoll}
      />
    );
  }


  return (
    <div className="space-y-3">

      {polls.map((p) => (
        <div
          key={p.AssignedPoll_ID}
          onClick={() => {
            setSelectedPoll(p);
            setPage("result");
          }}
          className="flex justify-between items-center p-4 rounded-xl
          bg-slate-800 border border-slate-700
          hover:border-cyan-400/40 hover:shadow-lg hover:shadow-cyan-400/10
          cursor-pointer transition"
        >

          <div>
            <div className="font-medium text-slate-100">
              {p.Poll_Question}
            </div>

            <div className="text-sm text-slate-400">
              {formatSmartDate(p.Created_At)}
            </div>
          </div>

          <div className="text-slate-300 font-semibold">
            {p.student_count}
          </div>

        </div>
      ))}

      {polls.length === 0 && (
        <div className="text-center text-gray-400 py-10">
          ยังไม่มี Poll
        </div>
      )}

    </div>
  );
}