import { FileText } from "lucide-react";
import { useProblems } from "../../contexts/problemsContext";
import { Card, CardContent } from "../ui/Card";
import Badge from "../ui/Badge";
import CodeEditor from "./CodeEditor";
import axios from "axios";
import { useState } from "react";

const Interview = () => {
  const { problems } = useProblems();
  const [compilerError, setCompilerError] = useState("");
  const [actual, setActual] = useState("");
  const [expected, setExpected] = useState("");
  const [testInput, setTestInput] = useState("");
  const [submitStatus, setSubmitStatus] = useState<"isCompilerError" | "isRuntimeError" | "passed">("passed")
  const problem = problems.find(p => p.id === '1');

   const onSubmitCode = (newLanguage: string, code: string) => {
    const langType: string | undefined= {
      javascript: "js",
      python: "py",
      cpp: "cpp",
      java: "java",
    }[newLanguage];
    const data = {
      code: code,
      langType: langType,
      timeout: 2,
      inputLines: 2
    }
    axios.post('https://api.deepcode-server.xyz/submit-code', data).then(({data: res}) => {
      if ("isCompilerError" in res && res.isCompilerError !== "") {
        setCompilerError(res.isCompilerError);
        setSubmitStatus("isCompilerError");
      } else if ("isError" in res && res.isError) {
        setSubmitStatus("isRuntimeError");
        setActual(res.actual);
        setExpected(res.expected);
        setTestInput(res.input || "");
      } else {
        setSubmitStatus("passed");
      }
    });

  };
  return (
      <div className="flex flex-col lg:flex-row gap-6 h-[calc(100vh-120px)]">
        <div className="lg:w-1/2 space-y-6 flex flex-col overflow-hidden">
          <Card className="flex flex-col flex-1 overflow-hidden">
            <div className="border-b border-gray-200 dark:border-gray-700">
              <div className="flex">
                <button
                  className={`flex items-center px-4 py-3 text-sm font-medium ${
"border-b-2 border-indigo-600 text-indigo-600"
                  }`}
                >
                  <FileText size={16} className="mr-2" />
                  Problem
                </button>
              </div>
            </div>

            <CardContent className="p-6 overflow-y-auto flex-1">
                <div className="space-y-4">
                  <div className="flex flex-wrap gap-2 mb-4">
                    {problem?.topics.map((topic) => (
                      <Badge key={topic} variant="primary" size="sm">
                        {topic}
                      </Badge>
                    ))}
                  </div>
                  <div className="prose dark:prose-invert max-w-none dark:text-white">
                    <h2 className="text-l font-semibold mb-4">
                      Problem Statement
                    </h2>
                    <p className="text-sm">{problem?.description}</p>

                    {problem && 
                    (
                      <div className="mt-6">
                        <h3 className="text-l font-semibold mb-2">Examples</h3>
                        <div className="space-y-4">
                          {problem.examples?.map((example, index) => (
                            <div
                              key={index}
                              className="bg-gray-100 dark:bg-gray-700 p-4 rounded-md text-sm"
                            >
                              <div className="mb-2">
                                <strong>Input:</strong> {example.input}
                              </div>
                              <div className="mb-2">
                                <strong>Output:</strong> {example.output}
                              </div>
                              {example.explanation && (
                                <div>
                                  <strong>Explanation:</strong>{" "}
                                  {example.explanation}
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    
              )}
              </div>
              </div>
            </CardContent>
          </Card>
        </div>
        <div className="lg:w-1/2 flex flex-col">
          <div className="flex-1">
            <CodeEditor language="python" onSubmitCode={onSubmitCode} />
          </div>
        </div>
      </div>
  );
}

export default Interview;