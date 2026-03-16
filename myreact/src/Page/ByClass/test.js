import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";

import { BrowserRouter, Routes, Route } from "react-router-dom";
import { TeacherProvider } from "./Page/TeacherContext";

/* =========================
   Teacher Pages
========================= */

import App from "./Page/Auth/App";
import Register from "./Page/Auth/Register";
import ForgotPassword from "./Page/Auth/ForgotPassword";
import ResetPassword from "./Page/Auth/ResetPassword";

import Myclass from "./Page/ManageClass/Myclass";
import Myclass_guest from "./Page/ManageClass/Myclass_guest";
import CreateClass from "./Page/ManageClass/CreateClass";
import HideClass from "./Page/ManageClass/ClassCard";

import ManageQuiz from "./Page/Quiz/ManageQuiz";
import Quiz_guest from "./Page/Quiz/Quiz_guest";
import CreateQuiz from "./Page/Quiz/CreateQuiz";
import AddQuestion from "./Page/Quiz/AddQuestion";
import EditQuiz from "./Page/Quiz/EditQuiz";
import EditQuestion from "./Page/Quiz/EditQuestion";

import ClassRoom from "./Page/ByClass/ClassRoom";
import ActivityLogPage from "./Page/ByClass/ActivityLog/ActivityLogPage";
import PlanPage from "./Page/ByClass/PlanPage";
import MainLayout from "./Page/ByClass/MainLayout";
import ReportLog from "./Page/ByClass/ReportLog/ReportLog";
import ManagementPage from "./Page/ByClass/ManagementPage";

import LobbyTeacher from "./Page/StartRoom/Lobby";
import AssignActivity from "./Page/StartRoom/AssignActivity/AssignActivity";

import QuizRoomPage from "./Page/StartRoom/Activity/Activity_Quiz/QuizRoomPage";
import TeamOverviewPage from "./Page/StartRoom/Activity/Activity_Quiz/Quiz_Team/TeamOverviewPage";
import TeacherTeamPreviewPage from "./Page/StartRoom/Activity/Activity_Quiz/Quiz_Team/TeacherTeamPreviewPage";

import Activity_Chat from "./Page/StartRoom/Activity/Activity_Chat/Activity_Chat";
import RoomPollTeacher from "./Page/StartRoom/Activity/Activity_Poll/RoomPollTeacher";

import ReportPage from "./Page/StartRoom/Activity/Activity_Quiz/Report_Quiz/Quiz_Report";
import GameAnalysis from "./Page/StartRoom/Activity/Activity_Quiz/Game_Analysis/GameAnalysis";

/* =========================
   Student Pages
========================= */

import JoinRoom from "./Page/Student/JoinRoom";
import StudentID from "./Page/Student/StudentID";
import SelectAvatarStudent from "./Page/Student/SelectAvatar";
import LobbyStudent from "./Page/Student/Lobby";

import QuizPage from "./Page/Student/QuizPage";
import RankingPage from "./Page/Student/RankingPage";

import EndQuizPageIndividual from "./Page/Student/EndQuizPageIndividual";
import EndQuizPageTeam from "./Page/Student/EndQuizPageTeam";

import FinalTeamRankingPage from "./Page/Student/FinalTeamRankingPage";
import FinalIndividualRankingPage from "./Page/Student/FinalIndividualRankingPage";

import StudentTeamPreviewPage from "./Page/Student/StudentTeamPreviewPage";

import OpenChat from "./Page/Student/OpenChat";
import RoomPollStudent from "./Page/Student/RoomPollStudents";
import GameAnalysisStudent from "./Page/Student/GameAnalysis";

import { Toaster } from "react-hot-toast";

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <TeacherProvider>
    <BrowserRouter>
    <Toaster position="top-right" />
      <Routes>

        {/* =========================
            STUDENT ROUTES
        ========================= */}

        <Route path="/" element={<JoinRoom />} />

        <Route path="/class/:joinCode" element={<StudentID />} />
        <Route path="/class/:joinCode/student/:studentId/avatar" element={<SelectAvatarStudent />} />

        <Route path="/class/:joinCode/lobby" element={<LobbyStudent />} />

        <Route path="/class/:joinCode/lobby/chat/:activitySessionId" element={<OpenChat />} />
        <Route path="/class/:joinCode/lobby/poll/:activitySessionId" element={<RoomPollStudent />} />

        <Route path="/class/:joinCode/lobby/team/:activitySessionId" element={<StudentTeamPreviewPage />} />

        <Route path="/class/:joinCode/lobby/quiz/:activitySessionId" element={<QuizPage />} />

        <Route path="/class/:joinCode/lobby/quiz/:activitySessionId/end" element={<EndQuizPageIndividual />} />
        <Route path="/class/:joinCode/lobby/quiz/:activitySessionId/endteam" element={<EndQuizPageTeam />} />

        <Route path="/class/:joinCode/lobby/quiz/:activitySessionId/end/team" element={<FinalTeamRankingPage />} />

        <Route path="/class/:joinCode/lobby/quiz/:activitySessionId/end/ranking" element={<FinalIndividualRankingPage />} />

        <Route path="/class/:joinCode/lobby/quiz/:activitySessionId/end/analysis" element={<GameAnalysisStudent />} />

        <Route path="/class/:joinCode/lobby/quiz/:activitySessionId/ranking" element={<RankingPage />} />


        {/* =========================
            TEACHER ROUTES
        ========================= */}

        <Route path="/teacher" element={<App />} />

        <Route path="/register" element={<Register />} />
        <Route path="/forgot_password" element={<ForgotPassword />} />
        <Route path="/reset_password/:token" element={<ResetPassword />} />

        <Route path="/myclass" element={<Myclass />} />
        <Route path="/myclass_guest" element={<Myclass_guest />} />
        <Route path="/createclass" element={<CreateClass />} />
        <Route path="/hideclass" element={<HideClass />} />

        <Route path="/managequiz" element={<ManageQuiz />} />
        <Route path="/quiz_guest" element={<Quiz_guest />} />

        <Route path="/quizediter" element={<CreateQuiz />} />
        <Route path="/addquestion" element={<AddQuestion />} />
        <Route path="/editquiz/:setId" element={<EditQuiz />} />
        <Route path="/editquestion" element={<EditQuestion />} />

        <Route path="/classroom/:id" element={<ClassRoom />} />

        <Route path="/gameanalysis/:classId/:joinCode/:activitySessionId" element={<GameAnalysis />} />

        <Route path="/quiz_report/:classId/:joinCode/:activitySessionId" element={<ReportPage />} />

        {/* Layout routes */}

        <Route element={<MainLayout />}>
          <Route path="/plan" element={<PlanPage />} />
          <Route path="/activity-log/:classId" element={<ActivityLogPage />} />
          <Route path="/report" element={<ReportLog />} />
          <Route path="/management" element={<ManagementPage />} />
        </Route>

        {/* Activity */}

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

        <Route path="/room/lobby/:classId/:joinCode" element={<LobbyTeacher />} />

        <Route path="/room/assign/:classId/:joinCode" element={<AssignActivity />} />

        <Route
          path="/room/team/:classId/:joinCode/:activitySessionId"
          element={<TeamOverviewPage />}
        />

        <Route
          path="/room/teacher-preview/:classId/:joinCode/:activitySessionId"
          element={<TeacherTeamPreviewPage />}
        />

      </Routes>
    </BrowserRouter>
  </TeacherProvider>
);