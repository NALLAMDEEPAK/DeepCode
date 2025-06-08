import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ThemeProvider } from "./contexts/themeContext";
import Layout from "./components/Layout";
import CodeArena from "./components/codearena/CodeArena";
import TopicProblems from "./components/codearena/TopicProblems";
import Problem from "./components/codearena/Problem";

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
      <BrowserRouter>
        <Layout>
          <Routes>
            <Route path="/" element={<Navigate to="/code-arena" replace />} />
            <Route path="/code-arena" element={<CodeArena />} />
            <Route path="/code-arena/topic/:topic" element={<TopicProblems />} />
            <Route path="/code-arena/topic/:topic/problem/:id" element={<Problem />} />
          </Routes>
        </Layout>
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;
