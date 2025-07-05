import React, { createContext, useContext, useState, useEffect } from "react";
import axios from "axios";
import { Problem } from "../types";
import { profileEnd } from "console";

interface ProblemContextType {
  problems: Problem[];
  setProblems: React.Dispatch<React.SetStateAction<Problem[]>>;
  problemsSolved: string[];
  setProblemsSolved: React.Dispatch<React.SetStateAction<string[]>>;
}

interface Solved{
  problemId: string;
  difficulty: string;
  solvedAt: string;
}

const ProblemContext = createContext<ProblemContextType | null>(null);

export const ProblemProvider = ({ children }: { children: React.ReactNode }) => {
  const [problems, setProblems] = useState<Problem[]>([]);
  const [problemsSolved, setProblemsSolved] = useState<string[]>([]);

  useEffect(() => {
    const fetchProblems = async () => {
      const response = await axios.get<Problem[]>(process.env.NODE_ENV === 'production' ?'https://api.deepcode-server.xyz/dsalist': '/dsalist');
      setProblems(response.data);
      const res = await axios.get<Solved[]>(process.env.NODE_ENV === 'production' ? '/user/solved-problems' : '/user/solved-problems');
      const problemIds = res.data.map((item) => item.problemId);
      setProblemsSolved(problemIds);
    };
    fetchProblems();
  }, []);

  return (
    <ProblemContext.Provider value={{ problems, setProblems, problemsSolved, setProblemsSolved }}>
      {children}
    </ProblemContext.Provider>
  );
};

export const useProblems = () => {
  const context = useContext(ProblemContext);
  if (!context) {
    throw new Error("useProblems must be used within a ProblemProvider");
  }
  return context;
};
