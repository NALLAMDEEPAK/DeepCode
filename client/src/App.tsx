import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ThemeProvider } from "./contexts/themeContext";
import { AuthProvider } from "./contexts/authContext";
import { InterviewProvider } from "./contexts/interviewContext";
import Layout from "./components/Layout";
import CodeArena from "./components/codearena/CodeArena";
import TopicProblems from "./components/codearena/TopicProblems";
import Problem from "./components/codearena/Problem";
import MockArena from "./components/mockarena/MockArena";
import InterviewRoom from "./components/mockarena/InterviewRoom";
import InvitationView from "./components/interview/InvitationView";
import QuestionSelection from "./components/interview/QuestionSelection";
import Settings from "./components/settings/Settings";
import LoginPage from "./components/auth/LoginPage";
import AuthSuccess from "./components/auth/AuthSuccess";
import AuthError from "./components/auth/AuthError";
import ProtectedRoute from "./components/auth/ProtectedRoute";
import { ProblemProvider } from "./contexts/problemsContext";

const debounce = (callback: (...args: any[]) => void, delay: number) => {
  let tid: any;
  return function (...args: any[]) {
    const ctx = window;
    tid && clearTimeout(tid);
    tid = setTimeout(() => {
      callback.apply(ctx, args);
    }, delay);
  };
};

const _ResizeObserver = window.ResizeObserver;
window.ResizeObserver = class ResizeObserver extends _ResizeObserver {
  constructor(callback: (...args: any[]) => void) {
    super(debounce(callback, 20));
  }
};

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <ProblemProvider>
          <InterviewProvider>
            <BrowserRouter>
              <Routes>
                <Route path="/login" element={<LoginPage />} />
                <Route path="/auth/success" element={<AuthSuccess />} />
                <Route path="/auth/error" element={<AuthError />} />
                
                <Route path="/interview/invitation/:token" element={<InvitationView />} />
                
                <Route path="/" element={
                  <ProtectedRoute>
                    <Layout>
                      <Navigate to="/code-arena" replace />
                    </Layout>
                  </ProtectedRoute>
                } />
                
                <Route path="/code-arena" element={
                  <ProtectedRoute>
                    <Layout>
                      <CodeArena />
                    </Layout>
                  </ProtectedRoute>
                } />
                
                <Route path="/code-arena/topic/:topic" element={
                  <ProtectedRoute>
                    <Layout>
                      <TopicProblems />
                    </Layout>
                  </ProtectedRoute>
                } />
                
                <Route path="/code-arena/topic/:topic/problem/:id" element={
                  <ProtectedRoute>
                    <Layout>
                      <Problem />
                    </Layout>
                  </ProtectedRoute>
                } />
                
                <Route path="/mock-arena" element={
                  <ProtectedRoute>
                    <Layout>
                      <MockArena />
                    </Layout>
                  </ProtectedRoute>
                } />
              
                
                <Route path="/settings" element={
                  <ProtectedRoute>
                    <Layout>
                      <Settings />
                    </Layout>
                  </ProtectedRoute>
                } />
                
                <Route path="/interview/questions/:interviewId" element={
                  <ProtectedRoute>
                    <Layout>
                      <QuestionSelection />
                    </Layout>
                  </ProtectedRoute>
                } />
                
                <Route path="/mock-arena/room/:id" element={
                  <ProtectedRoute>
                    <InterviewRoom />
                  </ProtectedRoute>
                } />
              </Routes>
            </BrowserRouter>
          </InterviewProvider>
        </ProblemProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;