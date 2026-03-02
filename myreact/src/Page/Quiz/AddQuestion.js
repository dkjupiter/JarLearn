import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import Sidebar_account from "../Sidebar_account";

export default function AddQuestion() {
  const navigate = useNavigate();
  const { state } = useLocation();

  const [type, setType] = useState("single");
  const [text, setText] = useState("");
  const [options, setOptions] = useState(["", ""]);
  const [correct, setCorrect] = useState([]);
  const [msg, setMsg] = useState("");
  const [imageFile, setImageFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);

  const questionNumber = state?.newQuestionNumber;
  const setId = state?.setId ?? null;
  const isEditMode = !!setId;

  const draftQuestions =
    state?.draftQuestions ||
    JSON.parse(localStorage.getItem("draftQuestions")) ||
    [];

  const quizName =
    state?.quizName || localStorage.getItem("quizName");

  /* ---------------- restore state ---------------- */
  useEffect(() => {
    if (state?.text) setText(state.text);
    if (state?.options) setOptions(state.options);
    if (state?.correct) setCorrect(state.correct);
    if (state?.type) setType(state.type);
  }, [state]);

  /* ---------------- image preview ---------------- */
  useEffect(() => {
    if (!imageFile) {
      setPreviewUrl(null);
      return;
    }
    const objectUrl = URL.createObjectURL(imageFile);
    setPreviewUrl(objectUrl);
    return () => URL.revokeObjectURL(objectUrl);
  }, [imageFile]);

  /* ---------------- limits ---------------- */
  const limit = { single: 4, multiple: 5, ordering: 7 };

  const reorder = (list, start, end) => {
    const result = Array.from(list);
    const [removed] = result.splice(start, 1);
    result.splice(end, 0, removed);
    return result;
  };

  const onDragEnd = (result) => {
    if (!result.destination) return;
    const items = reorder(options, result.source.index, result.destination.index);
    setOptions(items);
    setCorrect(items.map((_, i) => i)); // logic เดิม
  };

  const switchType = (t) => {
    setType(t);
    setOptions(["", ""]);
    setCorrect([]);
  };

  const handleOptionChange = (i, value) => {
    const arr = [...options];
    arr[i] = value;
    setOptions(arr);
  };

  const toggleCorrect = (i) => {
    if (type === "single") setCorrect([i]);
    if (type === "multiple") {
      setCorrect(correct.includes(i)
        ? correct.filter((c) => c !== i)
        : [...correct, i]
      );
    }
  };

  const handleAddOption = () => {
    if (options.length >= limit[type]) return;
    setOptions([...options, ""]);
  };

  const removeOption = (i) => {
    if (options.length <= 2) return;
    const newOptions = options.filter((_, idx) => idx !== i);
    setOptions(newOptions);

    if (type === "ordering") {
      setCorrect(newOptions.map((_, i) => i));
    } else {
      setCorrect(correct.filter((c) => c !== i).map((c) => (c > i ? c - 1 : c)));
    }
  };

  /* ---------------- validation ---------------- */
  const validateQuestion = () => {
    if (!text.trim()) {
      setMsg("✕ Please type your question");
      return false;
    }
    if (options.some((opt) => !opt.trim())) {
      setMsg("✕ All choices must be filled");
      return false;
    }
    if ((type === "single" || type === "multiple") && correct.length === 0) {
      setMsg("✕ Please select the correct answer");
      return false;
    }
    setMsg("");
    return true;
  };

  /* ---------------- submit ---------------- */
  const submitQuestion = async () => {
    if (!validateQuestion()) return;

    const newQuestion = {
      type,
      text,
      options,
      correct: type === "ordering" ? options.map((_, i) => i) : correct,
      image: imageFile || null,
    };

    const updatedQuestions = [...draftQuestions, newQuestion];

    if (isEditMode) {
      navigate(`/editquiz/${setId}`, {
        state: { draftQuestions: updatedQuestions, quizName, setId },
      });
    } else {
      navigate("/quizediter", {
        state: { draftQuestions: updatedQuestions, quizName },
      });
    }
  };

  /* ================= UI ================= */
  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col">
      <Sidebar_account />

      <main className="flex flex-col flex-1 p-6 max-w-3xl mx-auto w-full">

        <h2 className="text-lg text-center text-slate-400 mb-4">
          Question {questionNumber}
        </h2>

        {/* TYPE SELECTOR */}
        <div className="flex border border-slate-700 rounded-xl overflow-hidden mb-5">
          {["single", "multiple", "ordering"].map((t) => (
            <button
              key={t}
              onClick={() => switchType(t)}
              className={`flex-1 py-3 capitalize transition ${
                type === t
                  ? "bg-cyan-400 text-slate-900"
                  : "bg-slate-800 text-slate-300 hover:bg-slate-700"
              }`}
            >
              {t}
            </button>
          ))}
        </div>

        {/* QUESTION INPUT */}
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Type your question..."
          className="w-full mb-5 p-4 bg-slate-800 border border-slate-700 rounded-xl resize-none min-h-[120px]"
        />

        {/* IMAGE UPLOAD */}
        <div className="relative w-full h-48 border border-slate-700 rounded-xl flex items-center justify-center mb-5">
          {imageFile ? (
            <>
              <img src={previewUrl} className="h-full object-cover rounded-xl" />
              <button
                onClick={() => setImageFile(null)}
                className="absolute top-2 right-2 bg-black/60 text-white px-2 py-1 rounded"
              >
                ✕
              </button>
            </>
          ) : (
            <>
              <input
                type="file"
                id="upload-img"
                className="hidden"
                accept="image/png, image/jpeg, image/webp"
                onChange={(e) => setImageFile(e.target.files[0])}
              />
              <label htmlFor="upload-img" className="cursor-pointer text-slate-400">
                Upload image
              </label>
            </>
          )}
        </div>

        {/* OPTIONS */}
        {type !== "ordering" && (
          <div className="space-y-3">
            {options.map((opt, i) => (
              <div key={i} className="flex items-center gap-3">
                <div
                  className={`w-6 h-6 rounded border cursor-pointer ${
                    correct.includes(i)
                      ? "bg-cyan-400 border-cyan-400"
                      : "border-slate-500"
                  }`}
                  onClick={() => toggleCorrect(i)}
                />
                <input
                  value={opt}
                  onChange={(e) => handleOptionChange(i, e.target.value)}
                  placeholder="Choice..."
                  className="flex-1 p-3 bg-slate-800 border border-slate-700 rounded-lg"
                />
                {options.length > 2 && (
                  <button onClick={() => removeOption(i)} className="text-red-400">
                    ✕
                  </button>
                )}
              </div>
            ))}
          </div>
        )}

        {/* ORDERING */}
        {type === "ordering" && (
          <DragDropContext onDragEnd={onDragEnd}>
            <Droppable droppableId="ordering">
              {(provided) => (
                <div ref={provided.innerRef} {...provided.droppableProps} className="space-y-3">
                  {options.map((opt, index) => (
                    <Draggable key={index} draggableId={`item-${index}`} index={index}>
                      {(provided) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          className="flex items-center gap-3 p-3 bg-slate-800 border border-slate-700 rounded-xl"
                        >
                          <span {...provided.dragHandleProps} className="cursor-move">☰</span>
                          <span className="w-6 text-center">{index + 1}</span>
                          <input
                            value={opt}
                            onChange={(e) => handleOptionChange(index, e.target.value)}
                            className="flex-1 p-3 bg-slate-900 rounded-lg border border-slate-700"
                          />
                          {options.length > 2 && (
                            <button onClick={() => removeOption(index)} className="text-red-400">
                              ✕
                            </button>
                          )}
                        </div>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </DragDropContext>
        )}

        {options.length < limit[type] && (
          <button
            onClick={handleAddOption}
            className="w-full mt-4 p-3 bg-slate-800 border border-slate-700 rounded-xl hover:bg-slate-700"
          >
            Add Choice
          </button>
        )}

        {msg && <p className="text-red-400 text-center mt-3">{msg}</p>}

        {/* ACTION BAR */}
        <div className="mt-auto pt-6 flex flex-col items-center gap-3">
          <button
            onClick={submitQuestion}
            className="w-72 py-3 bg-cyan-400 text-slate-900 rounded-xl font-semibold hover:bg-cyan-300"
          >
            Add Question
          </button>

          <button
            onClick={() =>
              navigate(-1, {
                state: { keepState: true, draftQuestions, quizName },
              })
            }
            className="w-72 py-3 border border-slate-600 rounded-xl text-slate-300 hover:bg-slate-800"
          >
            Back
          </button>
        </div>

      </main>
    </div>
  );
}