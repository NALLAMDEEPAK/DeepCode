import React, { createContext, useContext, useState, useEffect } from "react";
import axios from "axios";
import { Problem } from "../types";

interface ProblemContextType {
  problems: Problem[];
  setProblems: React.Dispatch<React.SetStateAction<Problem[]>>;
}

const ProblemContext = createContext<ProblemContextType | null>(null);

export const ProblemProvider = ({ children }: { children: React.ReactNode }) => {
  const [problems, setProblems] = useState<Problem[]>([]);

  useEffect(() => {
    const fetchProblems = async () => {
      const response = await axios.get<Problem[]>('https://api.deepcode-server.xyz/dsalist');
      setProblems(response.data);
    };
    fetchProblems();
  }, []);

  return (
    <ProblemContext.Provider value={{ problems, setProblems }}>
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
