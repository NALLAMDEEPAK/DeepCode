import {
  AlertCircle,
  Check,
  CheckCircle,
  Code2,
  Copy,
  Download,
  Play,
} from "lucide-react";
import React, { useState } from "react";
import Editor from "@monaco-editor/react";
import Button from "../ui/Button";
import axios from "axios";
interface CodeEditorProps {
  language?: string;
  onLanguageChange?: (language: string) => void;
  onSubmitCode?: (language: string, code: string) => void;
}
const CodeEditor = ({ language, onLanguageChange, onSubmitCode }: CodeEditorProps) => {
  const [code, setCode] = useState(`# q = int(input())
# for _ in rane(q):
  # your code here`);
  const [newLanguage, setNewLanguage] = useState(language ?? "python");
  const [isLoading, setIsLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [output, setOutput] = useState("");
  const [input, setInput] = useState(`3
2 7 11 15
9
3 2 4
6
1 2 3
4`);
  const [success, setIsSuccess] = useState("");

  const handleLanguageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedLanguage = e.target.value;
    setNewLanguage(selectedLanguage);
    if (onLanguageChange) {
      onLanguageChange(selectedLanguage);
    }
  };

  const handleRunCode = () => {
    setIsLoading(true);
    const langType = {
      javascript: "js",
      python: "py",
      cpp: "cpp",
      java: "java",
    }[newLanguage];
    const data = {
      code: code,
      langType: langType,
      input: input,
      timeout: 2
    }
    axios.post('http://localhost:8000/run-code', data).then(({ data: res }) => {
      setOutput(res.output ? res.output : res.error);
      (res.status >= 200 && res.status < 300) ? setIsSuccess("passed") : setIsSuccess("failed");
      setIsLoading(false);
    });
  };


  const handleCopyCode = () => {
    navigator.clipboard.writeText(code).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const handleEditorChange = (e: unknown) => {
    setCode(e as string);
  };

  const handleDownloadCode = () => {
    const fileType =
      {
        javascript: "js",
        python: "py",
        cpp: "cpp",
        java: "java",
      }[newLanguage] || "txt";

    const blob = new Blob([code], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `code.${fileType}`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleEditorDidMount = (editor: any, monaco: any) => {
    monaco.editor.defineTheme("myTheme", {
      base: "vs-dark",
      inherit: true,
      rules: [
        { token: "comment", foreground: "888888" },
        { token: "custom-info", foreground: "a3a7a9" },
        { token: "custom-error", foreground: "ee4444" },
      ],
      colors: {
        "editor.background": "#1F2937",
        "editor.lineHighlightBackground": "#2a2a3b",
        "editorCursor.foreground": "#ffffff",
        "editor.selectionBackground": "#264f78",
        "editorWidget.background": "#252525",
      },
    });

    monaco.editor.setTheme("myTheme");
  };

  const CodeLoader = () => {
    return (
      <div className="flex flex-col items-center justify-center space-y-4 md:h-52 overflow-hidden">
        <Code2 className="w-16 h-16 text-blue-500 animate-fade-blink" />
        <div className="text-center">
          <p className="text-lg font-medium text-gray-700 mb-2">Running...</p>
          <div className="flex items-center justify-center gap-1">
            <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"></div>
            <div
              className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"
              style={{ animationDelay: "0.1s" }}
            ></div>
            <div
              className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"
              style={{ animationDelay: "0.2s" }}
            ></div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="flex flex-col">
      <div className="flex items-center justify-between bg-gray-800 dark:bg-gray-800 text-white px-4 py-2 rounded-t-lg">
        <div className="flex items-center">
          <select
            value={newLanguage}
            onChange={handleLanguageChange}
            className="bg-gray-800 text-white text-sm rounded-md border-0 py-1 px-2"
          >
            <option value="javascript">JavaScript</option>
            <option value="typescript">TypeScript</option>
            <option value="python">Python</option>
            <option value="java">Java</option>
            <option value="cpp">C++</option>
          </select>
        </div>
      </div>
      <div className="relative h-full md:h-full rounded-b-lg">
        <Editor
          height="100%"
          language={language}
          value={code}
          onChange={handleEditorChange}
          options={{
            fontSize: 14,
            minimap: { enabled: false },
            automaticLayout: true,
          }}
          onMount={handleEditorDidMount}
        />
      </div>
    </div>
  );
};
export default CodeEditor;
