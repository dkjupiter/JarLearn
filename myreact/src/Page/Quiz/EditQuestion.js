import { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import { ImageIcon, Maximize2 } from "lucide-react";
import Sidebar_account from "../Sidebar_account";
import toast from "react-hot-toast";

export default function EditQuestion({ setTitle }) {

  const navigate = useNavigate();
  const location = useLocation();

  const { id, question, index, draftQuestions = [], quizName } = location.state || {};

  const [type, setType] = useState("single");
  const [text, setText] = useState("");
  const [options, setOptions] = useState(["", ""]);
  const [correct, setCorrect] = useState([]);


  const fileInputRef = useRef(null);

  const [imageUrl, setImageUrl] = useState(null);
  const [imageFile, setImageFile] = useState(null);

  const [showImage, setShowImage] = useState(false);
  const [errors, setErrors] = useState({});

  /* ---------------- load question ---------------- */

  useEffect(() => {

    if (!question) {
      setCorrect([]);
      return;
    }

    setType(question.type || "single");
    setText(question.text || "");
    setOptions(question.options || ["", ""]);
    setCorrect(question.correct || []);
    setImageUrl(question.image || null);
    setImageFile(null);

  }, [question]);

  /* ---------------- limits ---------------- */

  const limit = {
    single: 4,
    multiple: 5,
    ordering: 7,
  };

  /* ---------------- reorder ---------------- */

  const reorder = (list, start, end) => {

    const result = Array.from(list);
    const [removed] = result.splice(start, 1);
    result.splice(end, 0, removed);

    return result;

  };

  const onDragEnd = (result) => {

    if (type !== "ordering") return;
    if (!result.destination) return;

    const items = reorder(
      options,
      result.source.index,
      result.destination.index
    );

    setOptions(items);
    setCorrect(items.map((_, i) => i));

  };

  /* ---------------- handlers ---------------- */

  const switchType = (t) => {
    setType(t);
    setOptions(["", ""]);
    setCorrect([]);
  };

  const handleAddOption = () => {
    if (options.length < limit[type]) {
      setOptions([...options, ""]);
    }
  };

  const handleOptionChange = (i, value) => {

    const arr = [...options];
    arr[i] = value;

    setOptions(arr);
    // clear error เมื่อกรอกครบ
    if (arr.every((opt) => opt.trim())) {
      setErrors((prev) => ({ ...prev, options: "" }));
    }
  };

  const toggleCorrect = (i) => {

    if (type === "ordering") return;

    if (type === "single") setCorrect([i]);

    if (type === "multiple") {

      setCorrect(
        correct.includes(i)
          ? correct.filter((c) => c !== i)
          : [...correct, i]
      );

    }
    setErrors((prev) => ({ ...prev, correct: "" }));
  };

  const removeOption = (i) => {

    if (options.length <= 2) return;

    const newOptions = options.filter((_, idx) => idx !== i);

    setOptions(newOptions);

    if (type === "ordering") {

      setCorrect(newOptions.map((_, i) => i));

    } else {

      setCorrect(
        correct
          .filter((c) => c !== i)
          .map((c) => (c > i ? c - 1 : c))
      );

    }

  };

  /* ---------------- submit ---------------- */

  const submitQuestion = async () => {
    let newErrors = {};

    if (!text.trim()) {
      newErrors.text = "Please type your question";
    }

    if (options.some((opt) => !opt.trim())) {
      newErrors.options = "All choices must be filled";
    }

    if ((type === "single" || type === "multiple") && correct.length === 0) {
      newErrors.correct = "Please select the correct answer";
    }

    setErrors(newErrors);

    if (Object.keys(newErrors).length > 0) return;

    let finalImage = null;

    if (imageFile) {
      finalImage = await uploadImage(imageFile);
    } else if (imageUrl) {
      finalImage = imageUrl;
    }

    const updatedQuestion = {
      type,
      text,
      options,
      correct,
      image: finalImage,
    };

    const updatedQuestions = [...draftQuestions];
    updatedQuestions[index] = updatedQuestion;

    if (id) {
      navigate(`/editquiz/${id}`, {
        state: { draftQuestions: updatedQuestions, quizName, id },
      });
    } else {
      navigate("/quizediter", {
        state: { draftQuestions: updatedQuestions, quizName },
      });
    }
  };

  /* ---------------- UI ---------------- */

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col">

      <Sidebar_account />

      <main className="flex flex-col flex-1 p-6 max-w-3xl mx-auto w-full">

        <h1 className="text-xl font-semibold mb-4">
          Edit Question
        </h1>

        {/* TYPE SELECTOR */}

        <div className="flex border border-slate-700 rounded-xl overflow-hidden mb-2">

          {["single", "multiple", "ordering"].map((t) => (

            <button
              key={t}
              onClick={() => switchType(t)}
              className={`flex-1 py-3 capitalize ${
                type === t
                  ? "bg-cyan-400 text-slate-900"
                  : "bg-slate-800 text-slate-300 hover:bg-slate-700"
              }`}
            >
              {t}
            </button>

          ))}

        </div>

        {/* TYPE DESCRIPTION */}

        <p className="text-sm text-slate-400 text-center mb-5">

          {type === "single" && "Select 1 correct answer"}
          {type === "multiple" && "Select multiple correct answers"}
          {type === "ordering" && "Drag choices into correct order"}

        </p>

        {/* QUESTION TEXT */}

        <textarea
          value={text}
          onChange={(e) => {
            setText(e.target.value);
            if (e.target.value.trim()) {
              setErrors((prev) => ({ ...prev, text: "" }));
            }
          }}
          placeholder="Type your question..."
          className={`w-full mb-1 p-4 bg-slate-800 border rounded-xl resize-none min-h-[120px]
            ${errors.text ? "border-rose-500 focus:ring-rose-400" : "border-slate-700 focus:ring-cyan-400"}
            focus:ring-2 focus:outline-none`}
        />

        {errors.text && (
          <p className="text-rose-500 text-xs mt-0.5 mb-3">{errors.text}</p>
        )}

        {/* IMAGE */}

        <div className="relative w-full h-60 border border-slate-700 rounded-xl flex items-center justify-center mb-5">

          {(imageFile || imageUrl) ? (

            <>
              <img
                src={imageFile ? URL.createObjectURL(imageFile) : imageUrl}
                className="h-full object-cover rounded-xl"
              />

              {/* remove */}
              <button
                onClick={() => {
                  setImageFile(null);
                  setImageUrl(null);
                }}
                className="absolute top-2 right-2 bg-black/60 text-white px-2 py-1 rounded"
              >
                ✕
              </button>

              {/* maximize */}
              <button
                onClick={() => setShowImage(true)}
                className="absolute bottom-2 right-2 bg-slate-900 text-slate-100 p-2 rounded-lg"
              >
                <Maximize2 className="w-5 h-5" />
              </button>

            </>

          ) : (

            <>
              <input
                ref={fileInputRef}
                type="file"
                id="upload-img"
                className="hidden"
                accept="image/png, image/jpeg, image/webp"
                onChange={(e) => {
                  setImageFile(e.target.files[0]);
                  setImageUrl(null);
                }}
              />

              <label
                htmlFor="upload-img"
                className="
                w-full h-full
                flex flex-col items-center justify-center
                cursor-pointer
                text-slate-400
                hover:bg-slate-800
                rounded-xl
                transition
              "
              >

                <ImageIcon className="w-8 h-8 mb-2 text-slate-400" />

                <span className="font-medium">
                  Upload image
                </span>

                <p className="text-xs text-slate-500 mt-1">
                  Only .png .jpg .webp
                </p>

              </label>
            </>

          )}

        </div>

        {/* FULLSCREEN IMAGE */}

        {showImage && (
          <div
            className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center"
            onClick={() => setShowImage(false)}
          >
            <img
              src={imageFile ? URL.createObjectURL(imageFile) : imageUrl}
              className="max-w-[90%] max-h-[90%]"
            />
          </div>
        )}

        {/* OPTIONS */}

        {type !== "ordering" && (

          <div className="space-y-3">

            {options.map((opt, i) => (

              <div key={i} className="flex items-center gap-3">

                <div
                  className={`w-6 h-6 border cursor-pointer flex items-center justify-center rounded ${
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
                  className={`flex-1 p-3 bg-slate-800 border rounded-lg
                    ${errors.options ? "border-rose-500 focus:ring-rose-400" : "border-slate-700 focus:ring-cyan-400"}
                    focus:outline-none focus:ring-2`}
                />

                {options.length > 2 && (
                  <button
                    onClick={() => removeOption(i)}
                    className="text-red-400"
                  >
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

            <Droppable droppableId="droppable">

              {(provided) => (

                <div
                  ref={provided.innerRef}
                  {...provided.droppableProps}
                  className="space-y-3"
                >

                  {options.map((opt, index) => (

                    <Draggable key={index} draggableId={`item-${index}`} index={index}>

                      {(provided) => (

                        <div
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          className="flex items-center gap-3 p-4 bg-slate-800 border border-slate-700 rounded-xl"
                        >

                          <div
                            {...provided.dragHandleProps}
                            className="cursor-move px-3 py-2 bg-slate-700 rounded-lg"
                          >
                            ☰
                          </div>

                          <span className="w-6 text-center">
                            {index + 1}
                          </span>

                          <input
                            value={opt}
                            onChange={(e) => handleOptionChange(index, e.target.value)}
                            className="flex-1 p-3 bg-slate-900 rounded-lg border border-slate-700
                            focus:outline-none focus:ring-2 focus:ring-cyan-400"
                          />

                          {options.length > 2 && (
                            <button
                              onClick={() => removeOption(index)}
                              className="text-red-400"
                            >
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

        {/* ADD OPTION */}

        {options.length < limit[type] && (

          <button
            onClick={handleAddOption}
            className="w-full mt-4 p-3 bg-slate-800 border border-slate-700 rounded-xl hover:bg-slate-700"
          >
            Add Choice (max {limit[type]})
          </button>

        )}


        {/* ACTION BAR */}

        <div className="mt-6 flex flex-col items-center gap-3">

          {errors.options && (
            <p className="text-rose-500 text-sm text-center">
              {errors.options}
            </p>
          )}

          {errors.correct && (
            <p className="text-rose-500 text-sm text-center">
              {errors.correct}
            </p>
          )}

          <button
            onClick={submitQuestion}
            className="w-72 py-3 bg-cyan-400 text-slate-900 rounded-xl font-semibold hover:bg-cyan-300"
          >
            Save Question
          </button>

          <button
            onClick={() => navigate(-1)}
            className="w-72 py-3 border border-slate-600 rounded-xl text-slate-300 hover:bg-slate-800"
          >
            Back
          </button>

        </div>

      </main>

    </div>
  );
}

/* ---------------- Upload helper ---------------- */

const uploadImage = async (file) => {

  const formData = new FormData();
  formData.append("image", file);

  const res = await fetch(
    "http://localhost:4000/upload-question-image",
    {
      method: "POST",
      body: formData,
    }
  );

  const data = await res.json();
  return data.url;

};