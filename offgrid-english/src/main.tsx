import React from 'react';
import ReactDOM from 'react-dom/client';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import './index.css';
import './i18n/config'; // Initialize i18n
import App from './App';
import { Analytics } from './pages/Analytics';
import { TeacherValidation } from './pages/TeacherValidation';
import { ModuleLearning } from './pages/ModuleLearning';
import { ModulePractice } from './pages/ModulePractice';
import { SmartPractice } from './pages/SmartPractice';
import { ReviewMode } from './pages/ReviewMode';
import { Achievements } from './pages/Achievements';
import { Bookmarks } from './pages/Bookmarks';
import { ChallengeMode } from './pages/ChallengeMode';
import { ProgressReport } from './pages/ProgressReport';
import { MistakeJournal } from './pages/MistakeJournal';
import { TeacherDashboard } from './pages/TeacherDashboard';

const router = createBrowserRouter([
  { path: '/', element: <App /> },
  { path: '/analytics', element: <Analytics /> },
  { path: '/diagnostics', element: <Analytics /> }, // Backward compatibility
  { path: '/teacher-validation', element: <TeacherValidation /> },
  { path: '/learn/:moduleId', element: <ModuleLearning /> },
  { path: '/practice/:moduleId', element: <ModulePractice /> },
  { path: '/smart-practice', element: <SmartPractice /> },
  { path: '/review', element: <ReviewMode /> },
  { path: '/achievements', element: <Achievements /> },
  { path: '/bookmarks', element: <Bookmarks /> },
  { path: '/challenge', element: <ChallengeMode /> },
  { path: '/progress-report', element: <ProgressReport /> },
  { path: '/mistake-journal', element: <MistakeJournal /> },
  { path: '/teacher-dashboard', element: <TeacherDashboard /> }
]);

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>
);