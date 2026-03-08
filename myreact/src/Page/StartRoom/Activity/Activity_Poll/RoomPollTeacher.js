import { useEffect, useState } from "react"
import { socket } from "../../../../socket"
import { useParams, useNavigate } from "react-router-dom"

export default function RoomPollTeacher() {
    const navigate = useNavigate()
    const { activitySessionId, joinCode, classId } = useParams()

    const [results, setResults] = useState([])
    const [question, setQuestion] = useState("")
    const [pollId, setPollId] = useState(null)
    const [votingClosed, setVotingClosed] = useState(false)

    useEffect(() => {

        socket.emit("join_activity", { activitySessionId })

    }, [activitySessionId])

    useEffect(() => {

        socket.emit("get_poll", { activitySessionId })

    }, [activitySessionId])

    useEffect(() => {

        socket.on("poll_started", (data) => {

            setQuestion(data.question)
            setPollId(data.pollId)

            const initial = data.options.map(o => ({
                ...o,
                votes: 0,
                percent: 0
            }))

            setResults(initial)

        })

        socket.on("poll_result_update", (data) => {

            const total = data.reduce((s, r) => s + Number(r.votes), 0)

            const mapped = data.map(r => ({

                ...r,
                percent: total ? Math.round((r.votes / total) * 100) : 0

            }))

            setResults(mapped)

        })

        return () => {

            socket.off("poll_started")
            socket.off("poll_result_update")

        }

    }, [])

    useEffect(() => {

        socket.on("poll_ended", () => {

            navigate(`/room/assign/${classId}/${joinCode}`)
            //lobby/:classId/:joinCode

        })

        return () => socket.off("poll_ended")

    }, [joinCode])

    useEffect(() => {

        socket.on("poll_closed", () => {
            setVotingClosed(true)
        })

        return () => socket.off("poll_closed")

    }, [])

    return (

        <div className="w-full min-h-screen bg-slate-900 flex flex-col py-6 pt-[80px]">

            {/* CONTENT */}
            <div className="flex-1 overflow-y-auto px-6">

                {/* POLL NAME */}
                <h1 className="text-3xl font-bold text-center text-white mt-10 mb-10">
                    {question || "Poll"}
                </h1>

                {/* CHOICES */}
                <div className="flex flex-col gap-5 mb-20 items-center">

                    {results.map((r, index) => (

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


            {/* END POLL BUTTON */}
            <div className="flex flex-col gap-3 max-w-3xl mx-auto items-center">

                {!votingClosed ? (

                    <button
                        onClick={() => socket.emit("close_poll", { pollId })}
                        className="w-72 py-3 rounded-lg bg-yellow-400 text-slate-900 font-semibold"
                    >
                        Close Voting
                    </button>

                ) : (

                    <button
                        onClick={() => socket.emit("end_poll", { pollId })}
                        className="w-72 py-3 rounded-lg bg-cyan-400 text-slate-900 font-semibold"
                    >
                        End Poll
                    </button>

                )}

            </div>

        </div>

    );
}