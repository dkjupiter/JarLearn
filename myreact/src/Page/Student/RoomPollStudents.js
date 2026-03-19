import { useState, useEffect } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { socket } from "../../socket";
import { Trophy } from "lucide-react"

export default function RoomPollStudent() {
    const navigate = useNavigate()
    const { classId, joinCode, activitySessionId } = useParams()

    const savedPlayer = localStorage.getItem("student_meta")
    const playerData = savedPlayer ? JSON.parse(savedPlayer) : null
    const studentId = playerData?.studentId
    console.log("data:", classId, joinCode, activitySessionId, studentId);

    const [question, setQuestion] = useState("")
    const [options, setOptions] = useState([])
    const [voted, setVoted] = useState(false)
    const [pollId, setPollId] = useState(null)
    const [results, setResults] = useState([])
    const [showResults, setShowResults] = useState(false)
    const [votingClosed, setVotingClosed] = useState(false)
    const [hasVoted, setHasVoted] = useState(false)

    const [showResult, setShowResult] = useState(false)
    const [winners, setWinners] = useState([])

    useEffect(() => {

        socket.on("activity_started", (data) => {

            if (data.activityType === "poll") {

                navigate(`/room/poll/${classId}/${joinCode}/${data.activitySessionId}`)

            }

        })

        return () => socket.off("activity_started")

    }, [])

    useEffect(() => {

        socket.emit("join_activity", {
            activitySessionId,
            studentId
        })

        socket.emit("get_poll", { activitySessionId })
        console.log("activity ", activitySessionId)

    }, [activitySessionId])

    useEffect(() => {

        socket.on("poll_started", (data) => {

            setQuestion(data.question)
            setOptions(data.options)
            setPollId(data.pollId)

        })
        console.log("poll listener ready")
        return () => socket.off("poll_started")

    }, [])


    useEffect(() => {

        socket.on("poll_result_update", (data) => {

            const total = data.reduce((s, r) => s + Number(r.votes), 0)

            const mapped = data.map(r => ({
                ...r,
                percent: total ? Math.round((r.votes / total) * 100) : 0
            }))

            setResults(mapped)

            if (voted || votingClosed) {
                setShowResults(true)
            }

        })

        return () => socket.off("poll_result_update")

    }, [])

    const vote = (optionId) => {

        if (voted || votingClosed || !pollId || !studentId) return

        socket.emit("submit_poll_vote", {
            pollId,
            optionId,
            studentId
        })

        setVoted(true)
        setShowResults(true)
        setHasVoted(true)

    }

    useEffect(() => {

        socket.on("poll_ended", () => {

            navigate(`/class/${joinCode}/lobby`)

        })

        return () => socket.off("poll_ended")

    }, [joinCode])

    useEffect(() => {

        const handler = () => {

            setVotingClosed(true)
            setShowResults(true)

            if (results.length > 0) {

                const maxVotes = Math.max(...results.map(r => Number(r.votes)))

                const win = results.filter(r => Number(r.votes) === maxVotes)

                setWinners(win)
                setShowResult(true)
            }

        }

        socket.on("poll_closed", handler)

        return () => socket.off("poll_closed", handler)

    }, [results])

    return (

        <div className="w-full min-h-screen bg-slate-900 flex flex-col py-6 pt-[80px]">

            {/* CONTENT */}
            <div className="flex-1 overflow-y-auto px-6">

                {/* QUESTION */}
                <h1 className="text-3xl font-bold text-center text-white mt-10 mb-3">
                    {question}
                </h1>

                {/* MESSAGE */}
                {!showResults && !votingClosed && (
                    <p className="text-center text-slate-300 mb-10">
                        Tap an option below to vote
                    </p>
                )}

                {votingClosed && (
                    <p className="text-center text-yellow-400 mb-10">
                        Voting has been closed. Showing results.
                    </p>
                )}

                {/* OPTIONS / RESULTS */}
                <div className="flex flex-col gap-5 mb-20 items-center">

                    {/* ===== VOTING MODE ===== */}
                    {!showResults && options.map((o, index) => (

                        <div
                            key={o.PollOption_ID}
                            onClick={() => !votingClosed && vote(o.PollOption_ID)}
                            className={`
                        w-full max-w-3xl
                        py-4 px-5
                        rounded-xl
                        flex items-center justify-between
                        text-white font-medium
                        transition
                        ${votingClosed
                                    ? "bg-gray-600 cursor-not-allowed"
                                    : "bg-slate-700 hover:bg-slate-600 cursor-pointer"}
                    `}
                        >

                            <div className="flex items-center gap-3">
                                <span className="font-bold">{index + 1}</span>
                                <span>{o.Option_Text}</span>
                            </div>

                        </div>

                    ))}

                    {/* ===== RESULT MODE ===== */}
                    {showResults && results.map((r, index) => (

                        <div
                            key={r.PollOption_ID}
                            className="w-full flex justify-center"
                        >

                            <div className="relative w-full max-w-3xl h-14 bg-slate-700 rounded-xl overflow-hidden">

                                {/* progress */}
                                <div
                                    className="absolute left-0 top-0 h-full bg-cyan-400 transition-all duration-500"
                                    style={{ width: `${r.percent}%` }}
                                />

                                {/* label */}
                                <div className="absolute inset-0 flex items-center justify-between px-4 text-white font-medium">

                                    <div className="flex items-center gap-3">
                                        <span className="font-bold">{index + 1}</span>
                                        <span>{r.Option_Text}</span>
                                    </div>

                                    <span className="font-semibold">
                                        {r.percent}%
                                    </span>

                                </div>

                            </div>

                        </div>

                    ))}

                </div>

            </div>

            {showResult && winners.length > 0 && (

            <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">

                <div className="bg-slate-800 border border-slate-700 rounded-2xl p-8 text-center w-[90%] sm:w-[420px] shadow-2xl">

                    <div className="flex items-center justify-center gap-3 mb-4">
                        <Trophy size={32} className="text-yellow-400 drop-shadow-lg"/>
                        
                        <h2 className="text-2xl font-bold text-cyan-400">
                            Poll Result
                        </h2>
                    </div>

                    <p className="text-yellow-400 text-3xl font-bold mb-2">
                        {winners.length > 1 ? "It's a tie!" : "Winner"}
                    </p>

                    {winners.map((w) => (

                    <div key={w.PollOption_ID} className="mb-3">

                        <div className="text-2xl font-bold text-white">
                            {w.Option_Text}
                        </div>

                        <div className="text-cyan-400">
                            {w.percent}% of votes
                        </div>

                    </div>

                    ))}

                    <button
                        onClick={() => setShowResult(false)}
                        className="px-6 py-2 bg-cyan-400 text-slate-900 font-semibold rounded-lg
                        hover:bg-cyan-300 transition"
                    >
                        Continue
                    </button>

                </div>

            </div>

            )}
        </div>

    )

}