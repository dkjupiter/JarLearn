import { useState, useEffect } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
// import io from "socket.io-client";
import { socket } from "../../socket";
import Sidebar_account from "../Sidebar_account";

// const socket = io("http://localhost:4000");


export default function AddQuestion({ setTitle }) {
  const navigate = useNavigate();

  const [type, setType] = useState("single");
  const [text, setText] = useState("");
  const [image] = useState(null);
  const [options, setOptions] = useState(["", ""]);
  const [correct, setCorrect] = useState([]);
  const [msg, setMsg] = useState("");
  const [imageFile, setImageFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const { state } = useLocation();

  const questionNumber = state?.newQuestionNumber;
  // const draftQuestions = state?.draftQuestions ?? [];
  // const quizName = state?.quizName ?? "Quiz Name";

  // ⭐ ตัวตัดสินโหมด
  // const setId = state?.setId ?? null;
  // const isEditMode = !!setId;
  // const { state } = useLocation();

  const setId = state?.setId ?? null;
  const isEditMode = !!setId;

  console.log("AddQuestion setId =", setId);
  console.log("isEditMode =", isEditMode);



  const Loca = useLocation();
  const draftQuestions = Loca.state?.draftQuestions 
    || JSON.parse(localStorage.getItem("draftQuestions")) 
    || [];

  const quizName = Loca.state?.quizName 
      || localStorage.getItem("quizName") ;
      // || "Quiz Name";


  useEffect(() => {
    if (Loca.state?.text) setText(Loca.state.text);
    if (Loca.state?.options) setOptions(Loca.state.options);
    if (Loca.state?.correct) setCorrect(Loca.state.correct);
    if (Loca.state?.type) setType(Loca.state.type);
  }, [Loca.state]);

  // useEffect(() => {
  //   setQuestionNumber(draftQuestions.length + 1);
  // }, [draftQuestions]);

  // const [questionNumber, setQuestionNumber] = useState(1);


  // ------ limits ------
  const limit = {
    single: 4,
    multiple: 5,
    ordering: 7,
  };

  const onDragEnd = (result) => {
  if (!result.destination) return;

  const items = reorder(
    options,
    result.source.index,
    result.destination.index
  );

  setOptions(items);
  // ✅ ordering: correct = ลำดับปัจจุบัน
  setCorrect(items.map((_, i) => i));
};

  const reorder = (list, startIndex, endIndex) => {
  const result = Array.from(list);
  const [removed] = result.splice(startIndex, 1);
  result.splice(endIndex, 0, removed);
  return result;
  }; 

  const switchType = (t) => {
    setType(t);
    setOptions(["", ""]);
    setCorrect([]);
  };

  const handleAddOption = () => {
    if (options.length >= limit[type]) return;
    setOptions([...options, ""]);
  };

  const handleOptionChange = (i, value) => {
    const arr = [...options];
    arr[i] = value;
    setOptions(arr);
  };

  const toggleCorrect = (i) => {
    if (type === "single") {
      setCorrect([i]);
    } else if (type === "multiple") {
      if (correct.includes(i)) {
        setCorrect(correct.filter((c) => c !== i));
      } else {
        setCorrect([...correct, i]);
      }
    }
  };

  //อัปโหลดรูปภาพ
  const uploadImage = async (file) => {
    const formData = new FormData();
    formData.append("image", file);

    const res = await fetch("http://192.168.1.66:4000/upload-question-image", {
      method: "POST",
      body: formData,
    });

    const data = await res.json();
    return data.url; // Cloudinary URL
  };

  useEffect(() => {
  if (!imageFile) {
    setPreviewUrl(null);
    return;
  }

  const objectUrl = URL.createObjectURL(imageFile);
  setPreviewUrl(objectUrl);

  // 🔥 สำคัญมาก
  return () => URL.revokeObjectURL(objectUrl);
  }, [imageFile]);

  //เช็กว่าเลือกเฉลย หรือใส่โจทย์หรือยัง
  const validateQuestion = () => {
    // 1️⃣ ตรวจโจทย์
    if (!text.trim()) {
      setMsg("✕ Please type your question");
      return false;
    }

    // 2️⃣ ตรวจตัวเลือก
    if (options.some(opt => !opt.trim())) {
      setMsg("✕ All choices must be filled");
      return false;
    }

    // 3️⃣ ตรวจคำตอบที่ถูก
    if (type === "single" || type === "multiple") {
      if (correct.length === 0) {
        setMsg("✕ Please select the correct answer");
        return false;
      }
    }

    // ordering อย่างน้อยต้องมี 2 ตัวเลือก
    // if (type === "ordering" && options.length < 2) {
    //   setMsg("❌ Ordering question needs at least 2 choices");
    //   return false;
    // }

    // ผ่านหมด
    setMsg("");
    return true;
  };

  // const submitQuestion =  async () => {
  //   if (!validateQuestion()) return;

  //   let imagePath = null;

  //   if (imageFile) {
  //     imagePath = await uploadImage(imageFile);
  //   }

  //   const newQuestion = {
  //     type,
  //     text,
  //     options,
  //     correct: type === "ordering" ? options.map((_, i) => i) : correct,
  //     image: imagePath, // null ถ้าไม่เลือกรูป
  //   };
  //   console.log("📤 SUBMIT QUESTION:", newQuestion);

  //   localStorage.setItem("draftQuestions", JSON.stringify([...draftQuestions, newQuestion]));

  //   navigate("/quizediter", {
  //     state: {
  //       newQuestion,
  //       keepState: true,
  //       draftQuestions: [...draftQuestions, newQuestion],  // ⭐ รวมคำถามเก่า + ใหม่
  //       quizName
  //     }
  //   });
  // };

  const submitQuestion = async () => {
    if (!validateQuestion()) return;

    let imagePath = null;
    if (imageFile) imagePath = await uploadImage(imageFile);

    const newQuestion = {
      type,
      text,
      options,
      correct: type === "ordering"
        ? options.map((_, i) => i)
        : correct,
      image: imagePath,
    };

    const updatedQuestions = [...draftQuestions, newQuestion];

    // ===============================
    // 🟢 EDIT QUIZ (มี setId)
    // ===============================
    if (isEditMode) {
      navigate(`/editquiz/${setId}`, {
        state: {
          draftQuestions: updatedQuestions,
          quizName,
          setId,
        },
      });
      return;
    }

    // ===============================
    // 🔵 CREATE QUIZ (ยังไม่มี setId)
    // ===============================
    navigate("/quizediter", {
      state: {
        draftQuestions: updatedQuestions,
        quizName,
      },
    });
  };

  const removeOption = (indexToRemove) => {
    if (options.length <= 2) return;

    const newOptions = options.filter((_, i) => i !== indexToRemove);
    setOptions(newOptions);

    if (type === "ordering") {
      // ordering = correct คือ index ลำดับใหม่
      setCorrect(newOptions.map((_, i) => i));
    } else {
      const newCorrect = correct
        .filter((c) => c !== indexToRemove)
        .map((c) => (c > indexToRemove ? c - 1 : c));
      setCorrect(newCorrect);
    }
  };

  return (
    <div className="min-h-screen flex flex-col p-6 bg-white">
      <Sidebar_account />

      {/* HEADER */}
      <h1 className="text-center text-3xl font-bold mb-5">
        Quiz {setTitle}
      </h1>

      <h2 className="text-xl text-center text-gray-700 mb-6">
        Question {questionNumber}
      </h2>


      {/* TYPE SELECTOR */}
      <div className="flex border rounded-xl overflow-hidden mb-5">
        <button
          onClick={() => switchType("single")}
          className={`flex-1 py-3 ${
            type === "single" ? "bg-gray-400 text-white" : "bg-gray-200"
          }`}
        >
          1 answer
        </button>

        <button
          onClick={() => switchType("multiple")}
          className={`flex-1 py-3 ${
            type === "multiple" ? "bg-gray-400 text-white" : "bg-gray-200"
          }`}
        >
          many answer
        </button>

        <button
          onClick={() => switchType("ordering")}
          className={`flex-1 py-3 ${
            type === "ordering" ? "bg-gray-400 text-white" : "bg-gray-200"
          }`}
        >
          sort answer
        </button>
      </div>



      {/* QUESTION INPUT BUTTON */}
      <button
      onClick={() =>
        navigate(`/addquestiontype`, {
          state: {
            ...Loca.state,   // ⭐ carry ของเดิมทั้งหมด
            setId,               // ⭐ ย้ำให้ชัด
            quizName,
            draftQuestions,
            text,
            options,
            correct,
            type,
            image: imageFile, 
          },
        })
      }
      className="w-full mb-4 p-4 border rounded-xl text-left bg-white"
    >
      {text ? text : "Type Your Question*"}
    </button>

      {/* พรีวิวรูป */}
      {/* <div className="w-full h-48 border rounded-xl flex flex-col items-center justify-center mb-5">
  {previewUrl ? (
    <img
      src={previewUrl}
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
      <label
        htmlFor="upload-img"
        className="flex flex-col items-center cursor-pointer"
      >
        <div className="text-4xl mb-2">+</div>
        <p>Upload your file</p>
      </label>
    </>
  )}
</div> */}

        <div className="relative w-full h-48 border rounded-xl flex items-center justify-center mb-5">
  {imageFile  ? (
    <>
      <img
        src={previewUrl}
        alt="preview"
        className="h-full object-cover rounded-xl"
      />

      {/* ❌ ปุ่มลบรูป */}
      <button
        type="button"
        onClick={() => {
          setImageFile(null);
        }}
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
        onChange={(e) => {
          setImageFile(e.target.files[0]);
        }}
      />
      <label htmlFor="upload-img" className="flex flex-col items-center cursor-pointer">
        <div className="text-4xl mb-2">+</div>
        <p>Upload your file</p>
      </label>
    </>
  )}
</div>

      {/* OPTIONS */}
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

      {/* SUBMIT */}
      <button
        onClick={submitQuestion}
        // className="fixed bottom-24 w-72 py-3 border border-gray-600 text-gray-700 rounded-xl hover:bg-gray-100  self-center"
        className="fixed bottom-24 w-72 py-3 bg-gray-600 text-white rounded-xl  hover:bg-gray-100  self-center"
      >
        Add Question
      </button>

      {msg && <p className="mt-3 text-center text-lg text-red-500">{msg}</p>}

      {/* BACK BUTTON */}
      <button
        onClick={() => navigate(-1, {
          state: {
            // newQuestion,
            keepState: true,
            draftQuestions: [...draftQuestions ],  // ⭐ รวมคำถามเก่า + ใหม่
            quizName
          }
        })}
        // className="fixed bottom-10 w-72 py-3 bg-gray-600 text-white rounded-xl  hover:bg-gray-100  self-center"
        className="fixed bottom-10 w-72 py-3 border border-gray-600 text-gray-700 rounded-xl hover:bg-gray-100  self-center"
      >
        Back
      </button>
    </div>
  );
}
