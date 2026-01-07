import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import App from "./Page/App";
import Register from "./Page/Register";

// Manage Class
import Myclass from "./Page/ManageClass/Myclass";
import Myclass_guest from "./Page/ManageClass/Myclass_guest";
import CreateClass from "./Page/ManageClass/CreateClass";
import HideClass from "./Page/ManageClass/ClassCard";

// By Class
import ClassRoom from "./Page/ByClass/ClassRoom";

// Manage Quiz
import ManageQuiz from "./Page/Quiz/ManageQuiz";
import Quiz_guest from "./Page/Quiz/Quiz_guest";
import CreateQuiz from "./Page/Quiz/CreateQuiz";
import AddQuestion from "./Page/Quiz/AddQuestion";
import AddQuestionType from "./Page/Quiz/AddQuestionType";
import EditQuiz from "./Page/Quiz/EditQuiz";
import EditQuestion from "./Page/Quiz/EditQuestion";

// Avatar ?
import Avatar from "./Page/Avatar";


//classroom
import Inclassroom from "./Page/ByClass/ClassRoom";

import * as serviceWorkerRegistration from "./serviceWorkerRegistration";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { TeacherProvider } from "./Page/TeacherContext"; 

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
    <TeacherProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<App />} />
          <Route path="/register" element={<Register />} />

          <Route path="/myclass" element={<Myclass />} />
          <Route path="/myclass_guest" element={<Myclass_guest />} />
          <Route path="/createclass" element={<CreateClass />} />
          <Route path="/hideclass" element={<HideClass />} />

          <Route path="/managequiz" element={<ManageQuiz />} />
          <Route path="/quiz_guest" element={<Quiz_guest />} />
          <Route path="/quizediter" element={<CreateQuiz />} />
          <Route path="/addquestion" element={<AddQuestion />} />
          <Route path="/addquestiontype" element={<AddQuestionType />} />
          <Route path="/editquiz" element={<EditQuiz />} />
          <Route path="/editquestion" element={<EditQuestion />} />

          <Route path="/avatar" element={<Avatar />} />
          <Route path="/classroom/:id" element={<ClassRoom />} />
          <Route path="/quizediter/:setId" element={<CreateQuiz />} />
          <Route path="/addquestion/:id" element={<AddQuestion />} />
          <Route path="/addquestion/:id/:type" element={<AddQuestionType  />} />
          <Route path="/editquiz/:setId" element={<EditQuiz />} />
          <Route path="/editquestion/:id" element={<EditQuestion />} />

          <Route path="/classroom" element={<Inclassroom/>} />

        </Routes>
      </BrowserRouter>
    </TeacherProvider>
);

// Service Worker
serviceWorkerRegistration.register();
