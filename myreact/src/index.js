import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import App from "./Page/Auth/App";
import Register from "./Page/Auth/Register";
import ForgotPassword from "./Page/Auth/ForgotPassword";
import ResetPassword from "./Page/Auth/ResetPassword";

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
import EditQuiz from "./Page/Quiz/EditQuiz";
import EditQuestion from "./Page/Quiz/EditQuestion";

// Avatar ?
import SelectAvatar from "./Page/SelectAvatar";


//classroom
import Inclassroom from "./Page/ByClass/ClassRoom";
import ActivityLogPage from "./Page/ByClass/ActivityLog/ActivityLogPage";

import Lobby from "./Page/StartRoom/Lobby";
import AssignActivity from "./Page/StartRoom/AssignActivity/AssignActivity";

import * as serviceWorkerRegistration from "./serviceWorkerRegistration";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { TeacherProvider } from "./Page/TeacherContext";
import PlanPage from "./Page/ByClass/PlanPage";
import MainLayout from "./Page/ByClass/MainLayout";
import ReportLog from "./Page/ByClass/ReportLog";
import ManagementPage from "./Page/ByClass/ManagementPage";

// Activaty
import TeamOverviewPage from "./Page/StartRoom/Activity/Activity_Quiz/Quiz_Team/TeamOverviewPage";
import TeacherTeamPreviewPage from "./Page/StartRoom/Activity/Activity_Quiz/Quiz_Team/TeacherTeamPreviewPage";

import QuizRoomPage from "./Page/StartRoom/Activity/Activity_Quiz/QuizRoomPage";
import Activity_Chat from "./Page/StartRoom/Activity/Activity_Chat/Activity_Chat";


import ReportPage from "./Page/StartRoom/Activity/Activity_Quiz/Report_Quiz/Quiz_Report";
import GameAnalysis from "./Page/StartRoom/Activity/Activity_Quiz/Game_Analysis/GameAnalysis";

import RoomPollTeacher from "./Page/StartRoom/Activity/Activity_Poll/RoomPollTeacher";

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <TeacherProvider>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<App />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot_password" element={<ForgotPassword />} />

        <Route path="/myclass" element={<Myclass />} />
        <Route path="/myclass_guest" element={<Myclass_guest />} />
        <Route path="/createclass" element={<CreateClass />} />
        <Route path="/hideclass" element={<HideClass />} />

        <Route path="/managequiz" element={<ManageQuiz />} />
        <Route path="/quiz_guest" element={<Quiz_guest />} />
        <Route path="/quizediter" element={<CreateQuiz />} />
        <Route path="/addquestion" element={<AddQuestion />} />
        <Route path="/editquiz" element={<EditQuiz />} />
        <Route path="/editquestion" element={<EditQuestion />} />

        <Route path="/selectavatar" element={<SelectAvatar />} />
        <Route path="/class/:joinCode/student/:studentId/avatar" element={<SelectAvatar />} />
        <Route path="/classroom/:id" element={<ClassRoom />} />
        <Route path="/quizediter/:setId" element={<CreateQuiz />} />
        <Route path="/addquestion/:id" element={<AddQuestion />} />
        <Route path="/editquiz/:setId" element={<EditQuiz />} />
        <Route path="/editquestion/:id" element={<EditQuestion />} />

        <Route path="/classroom/:classId" element={<Inclassroom />} />

        <Route path="/gameanalysis/:classId/:joinCode/:activitySessionId" element={<GameAnalysis />} />
        <Route path="/quiz_report/:classId/:joinCode/:activitySessionId" element={<ReportPage />} />

        {/* 🔹 หน้าเรียนปกติ มี navbar */}
        <Route element={<MainLayout />}>
          <Route path="/plan" element={<PlanPage />} />
          <Route path="/activity-log/:classId" element={<ActivityLogPage />} />
          <Route path="/report" element={<ReportLog />} />
          <Route path="/management" element={<ManagementPage />} />
        </Route>

        <Route
          path="/room/quiz/:classId/:joinCode/:activitySessionId"
          element={<QuizRoomPage />}
        />
         <Route
          path="/room/poll/:classId/:joinCode/:activitySessionId"
          element={<RoomPollTeacher />}
        />
        <Route
          path="/room/chat/:classId/:joinCode/:activitySessionId"
          element={<Activity_Chat />}
        />

        {/* ไม่มี navbar */}
        <Route path="/room">
          <Route path="lobby/:classId/:joinCode" element={<Lobby />} />
          <Route path="assign/:classId/:joinCode" element={<AssignActivity />} />
          <Route path="team/:classId/:joinCode/:activitySessionId" element={<TeamOverviewPage />} />
          <Route path="teacher-preview/:classId/:joinCode/:activitySessionId" element={<TeacherTeamPreviewPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  </TeacherProvider>
);

// Service Worker
serviceWorkerRegistration.register();
