import { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import Sidebar_account from "../Sidebar_account";
// import { socket } from "../socket";

export default function EditQuestion({ setTitle }) {
  const navigate = useNavigate();
  const location = useLocation();

  // if (!location.state) {
  //   return <p className="p-6">No question data</p>;
  // }

  const { id, question, index, draftQuestions = [], quizName } = location.state || {};
  console.log(id)

  // const [id, setId] = useState();
  const [type, setType] = useState("single");
  const [text, setText] = useState("");
  const [options, setOptions] = useState(["", ""]);
  const [correct, setCorrect] = useState([]);
  const [msg, setMsg] = useState("");
  console.log(question?.correct);
  const fileInputRef = useRef(null);

  // ⭐ สำคัญ
  const [imageUrl, setImageUrl] = useState(null);   // รูปเดิม (URL)
  const [imageFile, setImageFile] = useState(null); // รูปใหม่ (File)

  /* ---------------- โหลดข้อมูลเดิม ---------------- */
  useEffect(() => {
    if (!question) {
      // fallback กรณีไม่มี question
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

  console.log(question?.imageUrl);
  console.log(question?.imageFile);

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
    if (type !== "ordering") return;
    if (!result.destination) return;

    const items = reorder(
      options,
      result.source.index,
      result.destination.index
    );

    setOptions(items);
    setCorrect(items.map((_, i) => i)); // ⭐⭐⭐ sync correct
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
    if (type === "ordering") return; // ⭐ กันพัง

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

  /* ---------------- Save Question ---------------- */
  const submitQuestion = async () => {
    if (!text.trim()) {
      setMsg("Please type your question");
      return;
    }

    let finalImage = null;

    // มีรูปใหม่ → upload
    if (imageFile) {
      finalImage = await uploadImage(imageFile);
    }
    // ไม่มีรูปใหม่ แต่ยังมีรูปเดิม
    else if (imageUrl) {
      finalImage = imageUrl;
    }
    // ลบรูปแล้ว = null

    const updatedQuestion = {
      type,
      text,
      options,
      correct,
      image: finalImage,
    };
    console.log("FINAL IMAGE =>", finalImage);

    const updatedQuestions = [...draftQuestions];
    updatedQuestions[index] = updatedQuestion;

    navigate(`/editquiz/${id}`, {
      state: {
        draftQuestions: updatedQuestions,
        quizName,
        id,
      },
    });
  };

  /* ---------------- UI ---------------- */
  return (
    <div className="min-h-screen bg-white flex flex-col">
      <Sidebar_account />
    
      <main className="
  p-6           /* 👈 เผื่อ sidebar */
  pt-[56px]            /* 👈 เผื่อ header */
  h-[calc(100vh-56px)]
  flex flex-col
">
  {/* HEADER */}
  <div className="p-6">
    <h1 className="text-2xl font-bold" >Edit Question</h1>
  </div>

      {/* -------- Type -------- */}
      <div className="flex-1 overflow-y-auto px-6">
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
          navigate("/editquestiontype", {
            state: {
                    id,
                    index,
                    question: {
                      type,
                      text,
                      options,
                      correct,
                      image: imageFile || imageUrl,
                    },
                    draftQuestions,
                    quizName,
                  },
          })
        }
        className="w-full mb-4 p-4 border rounded-xl text-left bg-white"
      >
        {text || "Type Your Question*"}
      </button>

      {/* -------- Image -------- */}
      <div className="relative w-full h-48 border rounded-xl flex items-center justify-center mb-5">
        {(imageFile || imageUrl) ? (
          <>
            <img
              src={imageFile ? URL.createObjectURL(imageFile) : imageUrl}
              alt="preview"
              className="h-full object-cover rounded-xl"
            />

            {/* ปุ่มลบรูป */}
            <button
              type="button"
              onClick={() => {
                setImageFile(null);
                setImageUrl(null);
              }}
              className="absolute top-2 right-2 bg-black/60 text-white px-2 py-1 rounded"
            >
              ✕
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
            <label htmlFor="upload-img" className="flex flex-col items-center cursor-pointer">
              <div className="text-4xl mb-2">+</div>
              <p>Upload your file</p>
            </label>
          </>
        )}
      </div>

      {/* -------- Options -------- */}
            {type !== "ordering" && (
        <div className="space-y-3">
          {options.map((opt, i) => (
            <div key={i} className="flex items-center gap-3">
              
              {/* SELECTOR */}
              <div
                className={`w-7 h-7 border rounded-lg ${
                  correct.includes(i) ? "bg-gray-500" : "bg-gray-200"
                }`}
                onClick={() => toggleCorrect(i)}
              />
      
              {/* INPUT */}
              <input
                value={opt}
                onChange={(e) => handleOptionChange(i, e.target.value)}
                placeholder="Type choice*"
                className="flex-1 p-3 bg-gray-200 rounded-xl"
              />
      
              {/* REMOVE */}
              {options.length > 2 && (
                <button
                  onClick={() => removeOption(i)}
                  className="text-red-500 text-xl"
                >
                  ✕
                </button>
              )}
            </div>
          ))}
        </div>
      )}
      
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
                      {...provided.dragHandleProps}
                      className="flex items-center gap-3 p-3 bg-gray-200 rounded-xl"
                    >
                      <p className="w-6">{index + 1}</p>
      
                      <input
                        value={opt}
                        onChange={(e) => handleOptionChange(index, e.target.value)}
                        placeholder="Type choice*"
                        className="flex-1 p-3 bg-white rounded-lg border"
                      />
      
                      <span className="cursor-move">☰</span>
      
                      {options.length > 2 && (
                        <button
                          onClick={() => removeOption(index)}
                          className="text-red-500 text-xl"
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
                  className="w-full mt-4 p-3 bg-gray-200 rounded-xl"
              >
                  Add Choice (max {limit[type]})
              </button>
              )}
      
      </div> 

      {/* -------- Save -------- */}
      <div className="border-t bg-white p-4 flex flex-col items-center gap-3">
      <button
        onClick={submitQuestion}
        className="w-72 py-3 bg-gray-600 text-white rounded-lg ">
        Save Question
      </button>

      <button
        onClick={() => navigate(-1)}
        className="w-72 py-3 border rounded-lg">
        Back
      </button>

      {msg && <p className="text-red-500 text-center mt-3">{msg}</p>}
    </div>
    </main> 
    </div>  
  );
}

/* ---------------- Upload helper ---------------- */
// async function uploadImage(file) {
//   const formData = new FormData();
//   formData.append("file", file);
//   formData.append("upload_preset", "YOUR_PRESET");

//   const res = await fetch(
//     "https://api.cloudinary.com/v1_1/YOUR_CLOUD/image/upload",
//     { method: "POST", body: formData }
//   );

//   const data = await res.json();
//   return data.secure_url;
// }
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

