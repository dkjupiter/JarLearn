import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import Sidebar_account from "../Sidebar_account";

export default function EditQuestion({ setTitle }) {
  const navigate = useNavigate();
  const location = useLocation();

  const { id, question, index, draftQuestions = [], quizName } = location.state || {};
  console.log(id)

  // const [id, setId] = useState();
  const [type, setType] = useState("single");
  const [text, setText] = useState("");
  const [options, setOptions] = useState(["", ""]);
  const [correct, setCorrect] = useState([]);
  const [msg, setMsg] = useState("");
  console.log(question.correct);

  // ⭐ สำคัญ
  const [imageUrl, setImageUrl] = useState(null);   // รูปเดิม (URL)
  const [imageFile, setImageFile] = useState(null); // รูปใหม่ (File)

  /* ---------------- โหลดข้อมูลเดิม ---------------- */
  useEffect(() => {
    if (!question) return;

    // setId(question.id);
    setType(question.type);
    setText(question.text);
    setOptions(question.options);
    setCorrect(question.correct);
    setImageUrl(question.image || null);
    setImageFile(null);
  }, [question]);

  /* ---------------- Limits ---------------- */
  const limit = {
    single: 4,
    multiple: 5,
    ordering: 7,
  };

  /* ---------------- Drag reorder ---------------- */
  const reorder = (list, start, end) => {
    const result = Array.from(list);
    const [removed] = result.splice(start, 1);
    result.splice(end, 0, removed);
    return result;
  };

  const onDragEnd = (result) => {
    if (type !== "ordering") return; // ⭐ สำคัญมาก
    if (!result.destination) return;

    const items = reorder(options, result.source.index, result.destination.index);
    setOptions(items);
  };


  /* ---------------- Handlers ---------------- */
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
  };

  const toggleCorrect = (i) => {
    if (type === "single") setCorrect([i]);
    if (type === "multiple") {
      setCorrect(
        correct.includes(i)
          ? correct.filter((c) => c !== i)
          : [...correct, i]
      );
    }
  };

  const removeOption = (i) => {
    if (options.length <= 2) return;
    setOptions(options.filter((_, idx) => idx !== i));
    setCorrect(correct.filter((c) => c !== i).map((c) => (c > i ? c - 1 : c)));
  };

  /* ---------------- Save Question ---------------- */
  const submitQuestion = async () => {
    if (!text.trim()) return setMsg("Please type your question");

    let finalImage = imageUrl;

    if (imageFile) {
      finalImage = await uploadImage(imageFile); // ⭐ ฟังก์ชันอัปโหลด
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

    localStorage.setItem("draftQuestions", JSON.stringify(updatedQuestions));

    navigate(`/editquiz/${id}`, {
      state: {
        draftQuestions: updatedQuestions,
        quizName,
      },
    });
  };

  /* ---------------- UI ---------------- */
  return (
    <div className="min-h-screen flex flex-col p-6 bg-white">
      <Sidebar_account />

      <h1 className="text-center text-3xl font-bold mb-5">
        Quiz {setTitle}
      </h1>

      {/* -------- Type -------- */}
      <div className="flex border rounded-xl overflow-hidden mb-5">
        {["single", "multiple", "ordering"].map((t) => (
          <button
            key={t}
            onClick={() => switchType(t)}
            className={`flex-1 py-3 ${
              type === t ? "bg-gray-400 text-white" : "bg-gray-200"
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {/* -------- Question text -------- */}
      <button
        onClick={() =>
          navigate("/addquestiontype", {
            state: { text, options, correct, type, image: imageUrl },
          })
        }
        className="w-full mb-4 p-4 border rounded-xl text-left bg-white"
      >
        {text || "Type Your Question*"}
      </button>

      {/* -------- Image -------- */}
      <div className="w-full h-48 border rounded-xl flex items-center justify-center mb-5">
  {imageFile ? (
    <img
      src={URL.createObjectURL(imageFile)}
      alt="preview"
      className="h-full object-cover rounded-xl"
    />
  ) : imageUrl ? (
    <img
      src={imageUrl}
      alt="preview"
      className="h-full object-cover rounded-xl"
    />
  ) : (
    <>
      <input
        type="file"
        id="upload-img"
        className="hidden"
        accept="image/png, image/jpeg, image/webp"
        onChange={(e) => setImageFile(e.target.files[0])}
      />
      <label htmlFor="upload-img" className="flex flex-col items-center cursor-pointer">
        <div className="text-4xl mb-2">+</div>
        <p>Upload your file</p>
      </label>
    </>
  )}
</div>

      {/* -------- Options -------- */}
      {options.map((opt, i) => (
        <div key={i} className="flex gap-3 mb-3">
          <div
            className={`w-7 h-7 border rounded-lg ${
              correct.includes(i) ? "bg-gray-500" : "bg-gray-200"
            }`}
            onClick={() => toggleCorrect(i)}
          />
          <input
            value={opt}
            onChange={(e) => handleOptionChange(i, e.target.value)}
            className="flex-1 p-3 bg-gray-200 rounded-xl"
          />
          {options.length > 2 && (
            <button onClick={() => removeOption(i)}>✕</button>
          )}
        </div>
      ))}

      {options.length < limit[type] && (
        <button onClick={handleAddOption} className="mt-4 p-3 bg-gray-200 rounded-xl">
          Add Choice
        </button>
      )}

      {/* -------- Save -------- */}
      <button
        onClick={submitQuestion}
        className="fixed bottom-24 w-72 py-3 bg-gray-600 text-white rounded-xl self-center"
      >
        Save Question
      </button>

      <button
        onClick={() => navigate(-1)}
        className="fixed bottom-10 w-72 py-3 border rounded-xl self-center"
      >
        Back
      </button>

      {msg && <p className="text-red-500 text-center mt-3">{msg}</p>}
    </div>
  );
}

/* ---------------- Upload helper ---------------- */
async function uploadImage(file) {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("upload_preset", "YOUR_PRESET");

  const res = await fetch(
    "https://api.cloudinary.com/v1_1/YOUR_CLOUD/image/upload",
    { method: "POST", body: formData }
  );

  const data = await res.json();
  return data.secure_url;
}
