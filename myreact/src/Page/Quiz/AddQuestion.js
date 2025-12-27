import { useState, useEffect } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
// import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import io from "socket.io-client";
import Sidebar_account from "../Sidebar_account";

const socket = io("http://localhost:4000");

export default function AddQuestion({ setTitle }) {
  const { id: setId } = useParams();
  const navigate = useNavigate();

  const [questionNumber, setQuestionNumber] = useState(1);
  const [type, setType] = useState("single");
  const [text, setText] = useState("");
  const [image, setImage] = useState(null);
  const [options, setOptions] = useState(["", ""]);
  const [correct, setCorrect] = useState([]);
  const [msg, setMsg] = useState("");

  const Loca = useLocation();
  // const draftQuestions = Loca.state?.draftQuestions || [];
  // const quizName = Loca.state?.quizName;
  const draftQuestions = Loca.state?.draftQuestions 
    || JSON.parse(localStorage.getItem("draftQuestions")) 
    || [];

  const quizName = Loca.state?.quizName 
      || localStorage.getItem("quizName") 
      || "Quiz Name";


useEffect(() => {
  if (Loca.state?.text) setText(Loca.state.text);
  if (Loca.state?.options) setOptions(Loca.state.options);
  if (Loca.state?.correct) setCorrect(Loca.state.correct);
  if (Loca.state?.type) setType(Loca.state.type);
}, [Loca.state]);



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

  // อัปเดต correct auto
  setCorrect(items.map((_, i) => i));
  };

  const reorder = (list, startIndex, endIndex) => {
  const result = Array.from(list);
  const [removed] = result.splice(startIndex, 1);
  result.splice(endIndex, 0, removed);
  return result;
  }; 

  // Load question count
  useEffect(() => {
    socket.emit("get_question_count", { setId });

    socket.on("question_count_result", (res) => {
      if (res.success) setQuestionNumber(res.count + 1);
    });

    return () => {
      socket.off("question_count_result");
    };
  }, [setId]);


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

  const addOrderingCorrect = () => {
    setCorrect(options.map((_, i) => i));
  };

  // const submitQuestion = () => {
  //   if (!text.trim()) return setMsg("Please type your question");

  //   socket.emit("add_question", {
  //     setId: Number(setId),
  //     type,
  //     text,
  //     image,
  //     options,
  //     correct,
  //   });
  // };

//   const submitQuestion = () => {
//   if (!text.trim()) return setMsg("Please type your question");

//   const newQuestion = { type, text, options, correct };

//   navigate(-1, {
//     state: {
//       newQuestion
//     }
//   });
// };

//   const submitQuestion = () => {
//   if (!text.trim()) return setMsg("Please type your question");

//   const newQuestion = { type, text, options, correct };
//     // console.log("Received question_sets_data:", newQuestion);
//   navigate("/quizediter", {
//     state: { newQuestion }
//   });
// };
    const submitQuestion = () => {
  if (!text.trim()) return setMsg("Please type your question");

  const newQuestion = { 
    type, 
    text, 
    options, 
    correct,
    image 
  };
  localStorage.setItem("draftQuestions", JSON.stringify([...draftQuestions, newQuestion]));

  navigate("/quizediter", {
    state: {
      newQuestion,
      keepState: true,
      draftQuestions: [...draftQuestions, newQuestion],  // ⭐ รวมคำถามเก่า + ใหม่
      quizName
    }
  });
};



  // useEffect(() => {
  //   socket.on("add_question_result", (res) => {
  //     if (res.success) {
  //       setMsg("Question Added!");
  //       navigate("/quizediter");
  //     } else {
  //       setMsg(res.message);
  //     }
  //   });

  //   return () => {
  //     socket.off("add_question_result");
  //   };
  // }, []);



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
      {/* <button
        onClick={() =>
          navigate(`/addquestion/${setId}/addquestiontype`, {
            state: { text },
          })
        }
        className="w-full mb-4 p-4 border rounded-xl text-left bg-white"
      >
        {text ? text : "Type Your Question*"}
      </button> */}
      <button
      onClick={() =>
        navigate(`/addquestiontype`, {
          state: { 
            text,
            options,
            correct,
            type,
            image
          },
        })
      }
      className="w-full mb-4 p-4 border rounded-xl text-left bg-white"
    >
      {text ? text : "Type Your Question*"}
    </button>




      {/* IMAGE UPLOAD */}
      {/* <div className="w-full h-48 border rounded-xl flex flex-col items-center justify-center mb-5">
        <input
          type="file"
          id="upload-img"
          className="hidden"
          accept="image/png, image/jpeg, image/webp"
          onChange={(e) => setImage(e.target.files[0])}
        />

        <label htmlFor="upload-img" className="flex flex-col items-center cursor-pointer">
          <div className="text-4xl mb-2">+</div>
          <p>Upload your file</p>
        </label>
      </div> */}
        <div className="w-full h-48 border rounded-xl flex flex-col items-center justify-center mb-5">
  {image ? (
    <img
      src={URL.createObjectURL(image)}
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
        onChange={(e) => setImage(e.target.files[0])}
      />
      <label htmlFor="upload-img" className="flex flex-col items-center cursor-pointer">
        <div className="text-4xl mb-2">+</div>
        <p>Upload your file</p>
      </label>
    </>
  )}
</div>




      {/* OPTIONS */}
      <div className="space-y-3">
        {options.map((opt, i) => (
          <div key={i} className="flex items-center gap-3">
            {/* SELECTOR BUTTON */}
            <div
              className={`w-7 h-7 border rounded-lg ${
                correct.includes(i) ? "bg-gray-500" : "bg-gray-200"
              }`}
              onClick={() =>
                type === "ordering" ? null : toggleCorrect(i)
              }
            ></div>

            {/* OPTION TEXT BOX */}
            <input
              value={opt}
              onChange={(e) => handleOptionChange(i, e.target.value)}
              placeholder="Type choice*"
              className="flex-1 p-3 bg-gray-200 rounded-xl"
            />
          </div>
        ))}
      </div>



      {/* ADD OPTION */}
        {options.length < limit[type] && (
        <button
            onClick={handleAddOption}
            className="w-full mt-4 p-3 bg-gray-200 rounded-xl"
        >
            Add Choice (max {limit[type]})
        </button>
        )}

      {/* ORDERING BUTTON */}
      {/* {type === "ordering" && (
  <DragDropContext onDragEnd={onDragEnd}>
    <Droppable droppableId="droppable">
      {(provided) => (
        <div {...provided.droppableProps} ref={provided.innerRef} className="space-y-3">
          {options.map((opt, index) => (
            <Draggable key={index} draggableId={`item-${index}`} index={index}>
              {(provided) => (
                <div
                  ref={provided.innerRef}
                  {...provided.draggableProps}
                  {...provided.dragHandleProps}
                  className="flex items-center gap-3 p-3 bg-gray-200 rounded-xl"
                >
                  <p className="w-6 text-gray-600">{index + 1}</p>
                  <input
                    value={opt}
                    onChange={(e) => handleOptionChange(index, e.target.value)}
                    className="flex-1 p-3 bg-white rounded-lg border"
                    placeholder="Type choice*"
                  />
                  <span className="text-gray-500">☰</span>
                </div>
              )}
            </Draggable>
          ))}
          {provided.placeholder}
        </div>
      )}
    </Droppable>
  </DragDropContext>
)} */}




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
        onClick={() => navigate("/quizediter", {
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


