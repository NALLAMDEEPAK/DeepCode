import React, { useState } from "react";
import Editor from "@monaco-editor/react";

interface CodeEditorProps {
  language?: string;
  onLanguageChange?: (language: string) => void;
  onSubmitCode?: (language: string, code: string) => void;
}

const CodeEditor = ({ language, onLanguageChange }: CodeEditorProps) => {
  const [code, setCode] = useState(`# Write your solution here
def solution():
    # Your code here
    pass`);
  const [newLanguage, setNewLanguage] = useState(language ?? "python");

  const handleLanguageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedLanguage = e.target.value;
    setNewLanguage(selectedLanguage);
    if (onLanguageChange) {
      onLanguageChange(selectedLanguage);
    }
  };

  const handleEditorChange = (e: unknown) => {
    setCode(e as string);
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

  return (
    <div className="flex flex-col h-full">
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
      <div className="relative flex-1 rounded-b-lg">
        <Editor
          height="100%"
          language={newLanguage}
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