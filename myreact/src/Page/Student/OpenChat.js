import { useState, useEffect, useRef } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { Send } from "lucide-react"
import { socket } from "../../socket";

export default function StudentChat(){

  const navigate = useNavigate()
  const { classId, joinCode, activitySessionId } = useParams()

  const savedPlayer = localStorage.getItem("student_meta")
  const playerData = savedPlayer ? JSON.parse(savedPlayer) : null
  const studentId = playerData?.studentId

  const [messages,setMessages] = useState([])
  const [input,setInput] = useState("")
  const [board,setBoard] = useState(null)

  const bottomRef = useRef(null)

  /* =========================
     LOAD DATA
  ========================= */

  useEffect(()=>{

    socket.emit("join_activity",{
      activitySessionId,
      studentId
    })

    socket.emit("get_board_messages",{activitySessionId})
    socket.emit("get_board_info",{activitySessionId})

    socket.on("board_messages",(msgs)=>{
      setMessages(msgs)
    })

    socket.on("board_message",(msg)=>{
      setMessages(prev=>[...prev,msg])
    })

    socket.on("board_info",(data)=>{
      setBoard(data)
    })

    socket.on("board_closed",()=>{
      navigate(`/class/${joinCode}/lobby`)
    })

    return ()=>{
      socket.off("board_messages")
      socket.off("board_message")
      socket.off("board_info")
      socket.off("board_closed")
    }

  },[])

  /* =========================
     AUTO SCROLL
  ========================= */

  useEffect(()=>{
    bottomRef.current?.scrollIntoView({behavior:"smooth"})
  },[messages])

  /* =========================
     SEND MESSAGE
  ========================= */

  const handleSend = ()=>{

    if(!input.trim()) return

    socket.emit("send_board_message",{
      activitySessionId,
      studentId,
      message:input
    })

    setInput("")
  }

  const formatTime = (date)=>{
    return new Date(date).toLocaleTimeString("en-US",{
      hour:"numeric",
      minute:"2-digit"
    })
  }

  return(

  <div className="flex flex-col min-h-screen bg-slate-900 text-white">

    {/* HEADER */}

    <div className="sticky top-0 bg-slate-800 p-6 text-center text-3xl font-bold border-b border-slate-700">

      {board?.Board_Name || "Interactive Board"}

      <div className="text-sm text-slate-400 mt-1">
        Ask your questions anonymously
      </div>

    </div>


    {/* CHAT BODY */}

    <div className="flex-1 overflow-y-auto px-10 pt-8 max-w-4xl w-full mx-auto">

      {messages.map((msg) => (

        <div
          key={msg.InteractiveBoardMessage_ID}
          className={`mb-5 flex ${
            msg.Sender_Type === "teacher" ? "justify-end" : "justify-start"
          }`}
        >

          <div
            className={`p-4 rounded-2xl shadow-sm
            max-w-[85%] md:max-w-[70%]

            ${
              msg.Sender_Type === "teacher"
                ? "bg-cyan-500 text-right"
                : "bg-slate-700"
            }
          `}
          >

            {/* Sender */}
            <div className="text-xs font-semibold opacity-80 mb-1">
              {msg.Sender_Type === "teacher" ? "Teacher" : "Anonymous"}
            </div>

            {/* Message */}
            <div className="text-base md:text-lg leading-relaxed break-words">
              {msg.Message}
            </div>

            {/* Time */}
            <div className="text-xs opacity-60 mt-2">
              {formatTime(msg.Sent_At)}
            </div>

          </div>

        </div>

      ))}

      <div ref={bottomRef}/>

    </div>


    {/* INPUT */}

    <div className="sticky bottom-0 bg-slate-800 border-t border-slate-700 p-6">

      <div className="max-w-4xl mx-auto flex gap-4">

        <input
          type="text"
          className="flex-1 bg-slate-900 border border-slate-600 px-4 py-3 rounded-xl outline-none
          focus:ring-2 focus:ring-cyan-400"
          placeholder="Ask a question..."
          value={input}
          onChange={(e)=>setInput(e.target.value)}
          onKeyDown={(e)=>e.key==="Enter" && handleSend()}
        />

        <button
          onClick={handleSend}
          className="px-6 py-3 rounded-xl bg-cyan-400 text-slate-900 font-semibold
          flex items-center gap-2"
        >
          <Send size={18}/>
        </button>

      </div>

    </div>

  </div>

  )

}