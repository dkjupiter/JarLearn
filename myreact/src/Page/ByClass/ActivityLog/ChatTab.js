import { useState, useEffect } from "react";
import ChatRoomPage from "./ChatRoomPage";
import { socket } from "../../../socket";
import { formatSmartDate } from "../../../utils/date";

export default function ChatTab({
  classId,
  onReportChange,
  requestBack,
  onBackHandled,
}) {

  const [page, setPage] = useState("list");
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [rooms, setRooms] = useState([]);

  /* =========================
     LOAD CHAT LOGS
  ========================= */

  useEffect(() => {

    if (!classId) return;

    socket.emit("get_chat_logs", { classId });
    console.log("request chat logs for class", classId)

    socket.on("chat_logs", (data) => {
      console.log("chat logs:", data)
      setRooms(data)
    })

    return () => socket.off("chat_logs");

  }, [classId]);

  /* =========================
     REPORT STATE
  ========================= */

  useEffect(() => {
    onReportChange?.(page !== "list");
  }, [page, onReportChange]);

  /* =========================
     BACK BUTTON
  ========================= */

  useEffect(() => {

    if (!requestBack) return;

    if (page === "room") {
      setPage("list");
      onBackHandled?.();
    }

  }, [requestBack, page, onBackHandled]);

  /* =========================
     ROOM PAGE
  ========================= */

  if (page === "room") {
    return <ChatRoomPage room={selectedRoom} />;
  }

  /* =========================
     ROOM LIST
  ========================= */

  return (
    <div className="space-y-3">

      {rooms.map((r) => (

        <div
          key={r.ActivitySession_ID}
          onClick={() => {
            setSelectedRoom(r);
            setPage("room");
          }}
          className="flex justify-between items-center p-4 rounded-xl
                 bg-slate-800 border border-slate-700
                 hover:border-cyan-400/40 hover:shadow-lg
                 cursor-pointer transition"
        >

          <div>
            <div className="font-medium text-slate-100">
              {r.Board_Name}
            </div>

            <div className="text-sm text-slate-400">
              End: {formatSmartDate(r.Assigned_At)}
            </div>
          </div>

          <div className="text-slate-300 font-semibold">
            {r.participant_count}
          </div>

        </div>

      ))}

    </div>
  );
}