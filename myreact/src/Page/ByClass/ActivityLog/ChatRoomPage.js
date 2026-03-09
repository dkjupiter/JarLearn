import { useState, useEffect, useRef } from "react";
import { socket } from "../../../socket";

export default function ChatRoomPage({ room }) {

  const [messages, setMessages] = useState([])
  const bottomRef = useRef(null)

  useEffect(() => {

    socket.emit("get_board_messages", {
      activitySessionId: room.ActivitySession_ID
    })

    socket.on("board_messages", (msgs) => {
      setMessages(msgs)
    })

    return () => socket.off("board_messages")

  }, [room])

  useEffect(()=>{
    bottomRef.current?.scrollIntoView({behavior:"smooth"})
  },[messages])

  const formatTime = (date)=>{
    return new Date(date).toLocaleTimeString("en-US",{
      hour:"numeric",
      minute:"2-digit"
    })
  }

  return (
    <div className="flex flex-col h-full max-w-3xl mx-auto px-4 py-6 text-slate-100">

      {/* HEADER */}

      <div className="bg-slate-800 rounded-2xl py-5 text-center mb-6 border border-slate-700">

        <div className="text-xl font-semibold">
          {room?.Board_Name}
        </div>

        <div className="text-sm text-slate-400">
          Chat history
        </div>

      </div>


      {/* CHAT BODY */}

      <div className="flex-1 overflow-y-auto space-y-6">

        {messages.map(msg => (

          <div
            key={msg.InteractiveBoardMessage_ID}
            className={`flex ${
              msg.Sender_Type === "teacher"
                ? "justify-end"
                : "justify-start"
            }`}
          >

            <div
              className={`max-w-[70%] p-4 rounded-2xl

              ${
                msg.Sender_Type === "teacher"
                  ? "bg-cyan-500 text-slate-900"
                  : "bg-slate-800 border border-slate-700"
              }

              `}
            >

              {/* sender */}

              <div className="text-xs font-semibold opacity-80 mb-1">

                {msg.Sender_Type === "teacher"
                  ? "Teacher"
                  : "Anonymous"}

              </div>

              {/* message */}

              <div className="text-base">
                {msg.Message}
              </div>

              {/* time */}

              <div className="text-xs opacity-60 mt-2 text-right">
                {formatTime(msg.Sent_At)}
              </div>

            </div>

          </div>

        ))}

        <div ref={bottomRef} />

      </div>

    </div>
  )
}