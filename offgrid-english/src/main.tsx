import React from 'react';
import ReactDOM from 'react-dom/client';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import './index.css';
import './i18n/config'; // Initialize i18n
import App from './App';
import { Analytics } from './pages/Analytics';
import { Settings } from './pages/Settings';
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
import { ScenarioMode } from './pages/ScenarioMode';
import { DuelMode } from './pages/DuelMode';
import PhonologyMode from './pages/PhonologyMode';

import { ClassroomSession } from './pages/ClassroomSession';
// import { PaperScreenshots } from './pages/PaperScreenshots';

import { AuthProvider } from './contexts/AuthContext';
import { ErrorBoundary } from './components/ErrorBoundary';

console.log('Main.tsx executing...');

const router = createBrowserRouter([
  { path: '/', element: <App /> },
  { path: '/settings', element: <Settings /> },
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
  { path: '/teacher-dashboard', element: <TeacherDashboard /> },
  { path: '/scenario/:scenarioId', element: <ScenarioMode /> },
  { path: '/duel', element: <DuelMode /> },
  { path: '/phonology', element: <PhonologyMode /> },
  { path: '/classroom', element: <ClassroomSession /> },
]);

try {
  const rootElement = document.getElementById('root');
  if (!rootElement) throw new Error('Root element not found');

  ReactDOM.createRoot(rootElement).render(
    <React.StrictMode>
      <ErrorBoundary>
        <AuthProvider>
          <RouterProvider router={router} />
        </AuthProvider>
      </ErrorBoundary>
    </React.StrictMode>
  );
  console.log('React app mounted successfully');
} catch (error) {
  console.error('Failed to mount React app:', error);
}