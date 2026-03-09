import { useEffect, useState, useRef } from "react"
import { socket } from "../../../../socket";
import { useParams, useNavigate } from "react-router-dom";
import { Send } from "lucide-react"

export default function TeacherChat() {

  const navigate = useNavigate()
  const { activitySessionId, joinCode, classId } = useParams()

  const [messages, setMessages] = useState([])
  const [input, setInput] = useState("")
  const [board, setBoard] = useState(null)
  const [showCloseConfirm, setShowCloseConfirm] = useState(false)
  const [showClosedPopup, setShowClosedPopup] = useState(false)

  const bottomRef = useRef(null)

  /* =========================
     LOAD DATA
  ========================= */

  useEffect(() => {

    socket.emit("join_activity", { activitySessionId })

    socket.emit("get_board_messages", { activitySessionId })

    socket.emit("get_board_info", { activitySessionId })

    socket.on("board_messages", (msgs) => {
      setMessages(msgs)
    })

    socket.on("board_message", (msg) => {
      setMessages(prev => [...prev, msg])
    })

    socket.on("board_info", (data) => {
      setBoard(data)
    })

    socket.on("board_closed", () => {
      setShowCloseConfirm(false)
      setShowClosedPopup(true)
    })

    return () => {
      socket.off("board_messages")
      socket.off("board_message")
      socket.off("board_info")
      socket.off("board_closed")
    }

  }, [activitySessionId])

  /* =========================
     AUTO SCROLL
  ========================= */

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  /* =========================
     SEND MESSAGE
  ========================= */

  const handleSend = () => {

    if (!input.trim()) return

    socket.emit("teacher_message", {
      activitySessionId,
      message: input
    })

    setInput("")
  }

  const closeBoard = () => {
    setShowCloseConfirm(true)

  }

  const formatTime = (date) => {
    return new Date(date).toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit"
    })
  }

  return (

    <div className="flex flex-col min-h-screen bg-slate-900 text-white">

      {/* HEADER */}

      <div className="sticky top-0 bg-slate-800 p-6 text-center text-3xl font-bold border-b border-slate-700 relative">

        {board?.Board_Name || "Interactive Board"}

        <button
          onClick={closeBoard}
          className="absolute right-6 top-6 bg-red-500 px-4 py-2 rounded-lg text-sm">
          Close Baord
        </button>

        <div className="text-sm text-slate-400 mt-1">
          Live student questions
        </div>

      </div>

      {/* CHAT BODY */}

      <div className="flex-1 overflow-y-auto px-10 pt-8 max-w-4xl w-full mx-auto">

        {messages.map(msg => (

          <div key={msg.InteractiveBoardMessage_ID} className="mb-6">

            <div className={`p-4 rounded-2xl max-w-[75%]

          ${msg.Sender_Type === "teacher"
                ? "bg-cyan-500 ml-auto text-right"
                : "bg-slate-700"}

          `}>

              <div className="text-xs font-semibold opacity-80 mb-1">

                {msg.Sender_Type === "teacher"
                  ? "Teacher"
                  : "Anonymous"}

              </div>

              <div className="text-lg">
                {msg.Message}
              </div>

              <div className="text-xs opacity-60 mt-2">
                {formatTime(msg.Sent_At)}
              </div>

            </div>

          </div>

        ))}

        <div ref={bottomRef} />

      </div>

      {/* INPUT */}

      <div className="sticky bottom-0 bg-slate-800 border-t border-slate-700 p-6">

        <div className="max-w-4xl mx-auto flex gap-4">

          <input
            type="text"
            className="flex-1 bg-slate-900 border border-slate-600 px-4 py-3 rounded-xl outline-none
          focus:ring-2 focus:ring-cyan-400"
            placeholder="Reply to students..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
          />

          <button
            onClick={handleSend}
            className="px-6 py-3 rounded-xl bg-cyan-400 text-slate-900 font-semibold">
            <Send size={18} />
          </button>

        </div>

      </div>

      {/* CLOSE CONFIRM MODAL */}

      {showCloseConfirm && (

        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">

          <div className="p-6 w-full max-w-md bg-slate-800 rounded-2xl text-center">

            <h2 className="text-xl font-bold mb-4">
              Close Interactive Board?
            </h2>

            <p className="text-slate-400 mb-6">
              Students will no longer be able to send messages.
            </p>

            <div className="flex justify-center gap-4">

              <button
                onClick={() => setShowCloseConfirm(false)}
                className="px-5 py-2 bg-slate-600 rounded-lg">
                Cancel
              </button>

              <button
                onClick={() => {
                  socket.emit("end_board_session", { activitySessionId })
                  setShowCloseConfirm(false)
                }}
                className="px-5 py-2 bg-red-500 rounded-lg">
                Close Board
              </button>

            </div>

          </div>

        </div>

      )}

      {/* BOARD CLOSED MODAL */}

      {showClosedPopup && (

        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">

          <div className="bg-slate-800 p-8 rounded-2xl text-center w-96">

            <h2 className="text-xl font-bold mb-4">
              Board Closed
            </h2>

            <p className="text-slate-400 mb-6">
              The interactive board has been closed.
            </p>

            <button
              onClick={() => navigate(`/room/assign/${classId}/${joinCode}`)}
              className="px-6 py-2 bg-cyan-400 text-black rounded-lg font-semibold">
              Back
            </button>

          </div>

        </div>

      )}

    </div>

  )

}