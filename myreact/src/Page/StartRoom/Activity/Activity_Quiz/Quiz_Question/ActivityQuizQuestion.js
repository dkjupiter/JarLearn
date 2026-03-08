import { useState, useEffect } from "react";
import { Maximize2 } from "lucide-react";
import SingleRenderer from "./QuestionType/SingleRenderer";
import MultipleRenderer from "./QuestionType/MultipleRenderer";
import OrderingRenderer from "./QuestionType/OrderingRenderer";
import { Users, Clock } from "lucide-react";

const renderers = {
    single: SingleRenderer,
    multiple: MultipleRenderer,
    ordering: OrderingRenderer,
};

const instructions = {
    single: "Choose 1 choice",
    multiple: "Select all correct choices",
    ordering: "Drag to sort answers",
};

export default function ActivityQuizQuestion({
    question,
    current,
    total,
    timeLimit,
    onNext,
    onTimeUp,
    answeredCount,
    totalStudents,
}) {
    const [timer, setTimer] = useState(null);
    const [showImage, setShowImage] = useState(false);
    const [finished, setFinished] = useState(false);

    useEffect(() => {
        setTimer(timeLimit ?? null);
    }, [question?.Question_ID, timeLimit]);

    useEffect(() => {
        if (timer === null || timer <= 0) return;
        const interval = setInterval(() => setTimer((t) => t - 1), 1000);
        return () => clearInterval(interval);
    }, [timer]);

    useEffect(() => {
        if (timer === 0) onTimeUp?.();
    }, [timer]);

    useEffect(() => {
        if (
            !finished &&
            typeof totalStudents === "number" &&
            totalStudents > 0 &&
            answeredCount === totalStudents
        ) {
            setFinished(true);
            onTimeUp?.();
        }
    }, [answeredCount, totalStudents, finished]);

    if (!question) return null;

    const Renderer = renderers[question.Question_Type];

    console.log(answeredCount, totalStudents);

    return (
        <div className="w-full min-h-screen bg-slate-900 text-slate-100 flex flex-col items-center py-6">

            <p className="mb-4 text-slate-400 font-medium">
                Question {current}/{total}
            </p>

            <div className="w-11/12 max-w-3xl bg-slate-800 border border-slate-700 p-6 rounded-2xl text-center text-xl font-semibold mb-4">
                {question.Question_Text}
            </div>

            {question.Question_Image && (
                <div className="w-[200px] h-[200px] bg-slate-800 border border-slate-700 rounded-xl mb-4 relative">
                    <img src={question.Question_Image} className="w-full h-full object-contain" />
                    <button
                        onClick={() => setShowImage(true)}
                        className="absolute bottom-2 right-2 bg-slate-900 text-slate-100 px-3 py-1 rounded-lg"
                    >
                        <Maximize2 className="w-5 h-5" />
                    </button>
                </div>
            )}

            {showImage && (
                <div
                    className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center"
                    onClick={() => setShowImage(false)}
                >
                    <img src={question.Question_Image} className="max-w-[90%] max-h-[90%]" />
                </div>
            )}

            <p className="text-cyan-300 mb-3 text-m font-medium">
                {instructions[question.Question_Type]}
            </p>

            {/* Renderer */}
            {Renderer ? (
                <Renderer question={question} />
            ) : (
                <p className="text-red-400">Unsupported question type</p>
            )}

            {/* Footer */}
            <div className="mt-8 w-11/12 max-w-3xl flex items-center justify-between gap-4">

                {/* Left group */}
                <div className="flex items-center gap-3">

                    {/* Timer */}
                    {timer !== null && (
                        <div
                            className={`px-4 py-2 rounded-full font-semibold
                                    flex items-center gap-2
                                    ${timer <= 5
                                    ? "bg-red-500 text-white"
                                    : "bg-cyan-700 text-slate-100"
                                }`}
                        >
                            <Clock size={18} />
                            <span>{timer}s</span>
                        </div>
                    )}

                    {/* Answer progress */}
                    {typeof totalStudents === "number" && totalStudents > 0 ? (
                        <div className={`px-4 py-2 rounded-full flex items-center gap-2
                                ${answeredCount === totalStudents
                                ? "bg-green-600 text-white"
                                : "bg-slate-800 border border-slate-700 text-slate-200"
                            }`}>
                            <Users size={18} />
                            <span>{answeredCount}/{totalStudents} answered</span>
                        </div>
                    ) : (
                        <div className="px-4 py-2 rounded-full bg-slate-800 border border-slate-700 text-slate-400">
                            No students yet
                        </div>
                    )}
                </div>

                {/* Next */}
                <button
                    onClick={onNext}
                    className="px-6 py-3 rounded-lg
               bg-cyan-400 text-slate-900 font-semibold
               hover:bg-cyan-300 hover:scale-[1.02]
               shadow-lg shadow-cyan-400/30 transition"
                >
                    Next
                </button>

            </div>
        </div>
    );
}