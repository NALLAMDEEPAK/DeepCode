import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ThemeProvider } from "./contexts/themeContext";
import Layout from "./components/Layout";
import CodeArena from "./components/codearena/CodeArena";
import TopicProblems from "./components/codearena/TopicProblems";

function App() {
  return (
    <ThemeProvider>
      <BrowserRouter>
        <Layout>
          <Routes>
            <Route path="/" element={<Navigate to="/code-arena" replace />} />
            <Route path="/code-arena" element={<CodeArena />} />
            <Route path="/code-arena/topic/:topic" element={<TopicProblems />} />
          </Routes>
        </Layout>
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;
