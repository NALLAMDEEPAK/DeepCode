import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ThemeProvider } from "./contexts/themeContext";
import Layout from "./components/Layout";
import CodeArena from "./components/codearena/CodeArena";
import TopicProblems from "./components/codearena/TopicProblems";
import Problem from "./components/codearena/Problem";

import MockArena from "./components/mockarena/MockArena";
import Interview from "./components/mockarena/Interview";
import InterviewRoom from "./components/mockarena/InterviewRoom";
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
      <ProblemProvider>
        <BrowserRouter>
          <Routes>
            {/* Routes that use Layout */}
            <Route path="/" element={<Layout><Navigate to="/code-arena" replace /></Layout>} />
            <Route path="/code-arena" element={<Layout><CodeArena /></Layout>} />
            <Route
              path="/code-arena/topic/:topic"
              element={<Layout><TopicProblems /></Layout>}
            />
            <Route
              path="/code-arena/topic/:topic/problem/:id"
              element={<Layout><Problem /></Layout>}
            />
            <Route path="/mock-arena" element={<Layout><MockArena /></Layout>} />
            <Route path="/mock-arena/interview/:id" element={<Layout><Interview /></Layout>} />
            
            {/* Full-screen interview room without Layout */}
            <Route path="/mock-arena/room/:id" element={<InterviewRoom />} />
          </Routes>
        </BrowserRouter>
      </ProblemProvider>
    </ThemeProvider>
  );
}

export default App;