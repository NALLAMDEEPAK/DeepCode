import React, { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import Button from "../ui/Button";
import { ArrowLeft, Code2, FileText, Youtube, CheckCircle, XCircle, AlertCircle, Loader2, Clock, Target, Play } from "lucide-react";
import Badge from "../ui/Badge";
import { Card, CardContent } from "../ui/Card";
import CodeEditor from "./CodeEditor";
import axios from "axios";
import { useProblems } from "../../contexts/problemsContext";

const Problem = () => {
  const { problems } = useProblems();
  const { topic, id } = useParams();
  const [activeTab, setActiveTab] = useState<"problem" | "solution" | "submissions">("problem");
  const [problem, setProblem] = useState(problems.find((p) => p.id === id));
  const [isLoading, setIsLoading] = useState(false);
  const [compilerError, setCompilerError] = useState("");
  const [actual, setActual] = useState("");
  const [expected, setExpected] = useState("");
  const [testInput, setTestInput] = useState("");

  const [submitStatus, setSubmitStatus] = useState<"isCompilerError" | "isRuntimeError" | "passed">("passed")

  useEffect(() => {
    setProblem(problems.find((p) => p.id === id));
  }, [id]);

  const difficultyVariant = problem
    ? ({
        Easy: "success",
        Medium: "warning",
        Hard: "danger",
      }[problem.difficulty] as "success" | "warning" | "danger")
    : undefined;


  const onSubmitCode = (newLanguage: string, code: string) => {
    setIsLoading(true);
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
    setActiveTab("submissions");
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
      setIsLoading(false);
    });

  };

  const renderSubmissionResult = () => {
    if (isLoading) {
      return (
        <div className="flex flex-col items-center justify-center py-12 space-y-4">
          <div className="relative">
            <Loader2 className="w-12 h-12 text-indigo-600 animate-spin" />
          </div>
          <div className="text-center">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              Running Your Code...
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Please wait while we execute your solution
            </p>
          </div>
        </div>
      );
    }

    switch (submitStatus) {
      case "passed":
        return (
          <div className="space-y-6">
            <div className="flex flex-col items-center text-center py-8">
              <div className="relative mb-4">
                <div className="w-20 h-20 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
                  <CheckCircle className="w-10 h-10 text-green-600 dark:text-green-400" />
                </div>
              </div>
              <h3 className="text-2xl font-bold text-green-600 dark:text-green-400 mb-2">
                Accepted!
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                Your solution passed all test cases successfully
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
                <div className="flex items-center justify-center mb-2">
                  <Target className="w-5 h-5 text-green-600 dark:text-green-400 mr-2" />
                  <span className="text-sm font-medium text-green-800 dark:text-green-300">
                    Status
                  </span>
                </div>
                <p className="text-center text-lg font-bold text-green-600 dark:text-green-400">
                  Accepted
                </p>
              </div>
              
              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                <div className="flex items-center justify-center mb-2">
                  <Clock className="w-5 h-5 text-blue-600 dark:text-blue-400 mr-2" />
                  <span className="text-sm font-medium text-blue-800 dark:text-blue-300">
                    Runtime
                  </span>
                </div>
                <p className="text-center text-lg font-bold text-blue-600 dark:text-blue-400">
                  &lt; 1s
                </p>
              </div>
              
              <div className="bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-lg p-4">
                <div className="flex items-center justify-center mb-2">
                  <Code2 className="w-5 h-5 text-purple-600 dark:text-purple-400 mr-2" />
                  <span className="text-sm font-medium text-purple-800 dark:text-purple-300">
                    Memory
                  </span>
                </div>
                <p className="text-center text-lg font-bold text-purple-600 dark:text-purple-400">
                  16.2 MB
                </p>
              </div>
            </div>
          </div>
        );

      case "isCompilerError":
        return (
          <div className="space-y-6">
            <div className="flex flex-col items-center text-center py-6">
              <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mb-4">
                <XCircle className="w-8 h-8 text-red-600 dark:text-red-400" />
              </div>
              <h3 className="text-xl font-bold text-red-600 dark:text-red-400 mb-2">
                Compilation Error
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Your code contains syntax errors that prevent compilation
              </p>
            </div>
            
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
              <div className="px-4 py-3 border-b border-red-200 dark:border-red-800">
                <div className="flex items-center">
                  <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 mr-2" />
                  <h4 className="font-semibold text-red-800 dark:text-red-300">
                    Error Details
                  </h4>
                </div>
              </div>
              <div className="p-4">
                <pre className="text-sm text-red-700 dark:text-red-300 whitespace-pre-wrap font-mono bg-white dark:bg-gray-800 p-4 rounded border border-red-200 dark:border-red-700 overflow-x-auto">
                  {compilerError}
                </pre>
              </div>
            </div>
            
            <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
              <div className="flex items-start">
                <AlertCircle className="w-5 h-5 text-yellow-600 dark:text-yellow-400 mr-3 mt-0.5 flex-shrink-0" />
                <div>
                  <h4 className="font-semibold text-yellow-800 dark:text-yellow-300 mb-1">
                    Debugging Tips
                  </h4>
                  <ul className="text-sm text-yellow-700 dark:text-yellow-400 space-y-1">
                    <li>• Check for missing semicolons, brackets, or parentheses</li>
                    <li>• Verify variable names and function declarations</li>
                    <li>• Ensure proper indentation and syntax</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        );

      case "isRuntimeError":
        return (
          <div className="space-y-6">
            <div className="flex flex-col items-center text-center py-6">
              <div className="w-16 h-16 bg-orange-100 dark:bg-orange-900/30 rounded-full flex items-center justify-center mb-4">
                <AlertCircle className="w-8 h-8 text-orange-600 dark:text-orange-400" />
              </div>
              <h3 className="text-xl font-bold text-orange-600 dark:text-orange-400 mb-2">
                Runtime Error
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Your code produced incorrect output for the given test case
              </p>
            </div>

            {/* Test Input Section */}
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
              <div className="px-4 py-3 border-b border-blue-200 dark:border-blue-800">
                <div className="flex items-center">
                  <Play className="w-5 h-5 text-blue-600 dark:text-blue-400 mr-2" />
                  <h4 className="font-semibold text-blue-800 dark:text-blue-300">
                    Test Input
                  </h4>
                </div>
              </div>
              <div className="p-4">
                <pre className="text-sm text-blue-700 dark:text-blue-300 whitespace-pre-wrap font-mono bg-white dark:bg-gray-800 p-3 rounded border border-blue-200 dark:border-blue-700 overflow-x-auto">
                  {testInput}
                </pre>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                <div className="px-4 py-3 border-b border-green-200 dark:border-green-800">
                  <div className="flex items-center">
                    <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400 mr-2" />
                    <h4 className="font-semibold text-green-800 dark:text-green-300">
                      Expected Output
                    </h4>
                  </div>
                </div>
                <div className="p-4">
                  <pre className="text-sm text-green-700 dark:text-green-300 whitespace-pre-wrap font-mono bg-white dark:bg-gray-800 p-3 rounded border border-green-200 dark:border-green-700 overflow-x-auto">
                    {expected}
                  </pre>
                </div>
              </div>
              
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                <div className="px-4 py-3 border-b border-red-200 dark:border-red-800">
                  <div className="flex items-center">
                    <XCircle className="w-5 h-5 text-red-600 dark:text-red-400 mr-2" />
                    <h4 className="font-semibold text-red-800 dark:text-red-300">
                      Your Output
                    </h4>
                  </div>
                </div>
                <div className="p-4">
                  <pre className="text-sm text-red-700 dark:text-red-300 whitespace-pre-wrap font-mono bg-white dark:bg-gray-800 p-3 rounded border border-red-200 dark:border-red-700 overflow-x-auto">
                    {actual}
                  </pre>
                </div>
              </div>
            </div>
            
            <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
              <div className="flex items-start">
                <AlertCircle className="w-5 h-5 text-yellow-600 dark:text-yellow-400 mr-3 mt-0.5 flex-shrink-0" />
                <div>
                  <h4 className="font-semibold text-yellow-800 dark:text-yellow-300 mb-1">
                    Debugging Tips
                  </h4>
                  <ul className="text-sm text-yellow-700 dark:text-yellow-400 space-y-1">
                    <li>• Test your solution with the provided input above</li>
                    <li>• Compare your output character by character with the expected result</li>
                    <li>• Check for extra spaces, newlines, or formatting issues</li>
                    <li>• Verify your algorithm handles edge cases correctly</li>
                    <li>• Consider the problem constraints and requirements</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        );

      default:
        return (
          <div className="flex flex-col items-center justify-center py-12 text-gray-500 dark:text-gray-400">
            <Code2 className="w-12 h-12 mb-4" />
            <p>Submit your code to see results</p>
          </div>
        );
    }
  };

  return (
    <div>
      <div className="flex items-center mb-6">
          <Link to={`/code-arena/topic/${encodeURIComponent(topic ?? "")}/`} className="mr-4">

          <Button variant="ghost" icon={<ArrowLeft size={16} />}>
            Back
          </Button>
        </Link>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          {problem?.title}
        </h1>
        {problem && (
          <Badge variant={difficultyVariant} className="ml-4">
            {problem.difficulty}
          </Badge>
        )}
      </div>
      <div className="flex flex-col lg:flex-row gap-6">
        <div className="lg:w-1/2 space-y-6 flex flex-col overflow-hidden max-h-[80vh]">
          <Card className="flex flex-col flex-1 overflow-hidden">
            <div className="border-b border-gray-200 dark:border-gray-700">
              <div className="flex">
                <button
                  onClick={() => setActiveTab("problem")}
                  className={`flex items-center px-4 py-3 text-sm font-medium ${
                    activeTab === "problem"
                      ? "border-b-2 border-indigo-600 text-indigo-600"
                      : "text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
                  }`}
                >
                  <FileText size={16} className="mr-2" />
                  Problem
                </button>
                <button
                  onClick={() => setActiveTab("solution")}
                  className={`flex items-center px-4 py-3 text-sm font-medium ${
                    activeTab === "solution"
                      ? "border-b-2 border-indigo-600 text-indigo-600"
                      : "text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
                  }`}
                >
                  <Code2 size={16} className="mr-2" />
                  Solution
                </button>
                <button
                  onClick={() => setActiveTab("submissions")}
                  className={`flex items-center px-4 py-3 text-sm font-medium ${
                    activeTab === "submissions"
                      ? "border-b-2 border-indigo-600 text-indigo-600"
                      : "text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
                  }`}
                >
                  <Code2 size={16} className="mr-2" />
                  Submissions
                </button>
              </div>
            </div>

            <CardContent className="p-6 overflow-y-auto flex-1">
              {activeTab === "problem" ? (
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

                    {problem && (
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

                    {problem && (
                      <div className="mt-6">
                        <h3 className="text-m font-semibold mb-2">
                          Constraints
                        </h3>
                        <ul className="list-disc list-inside text-sm">
                          {problem.constraints?.map((constraint, index) => (
                            <li key={index}>{constraint}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>
              ) : 
              activeTab === "solution" ?
               (
                <div className="space-y-4 dark:text-white">
                  <h2 className="text-m font-semibold mb-4">Solution</h2>
                  <div className="prose dark:prose-invert max-w-none text-sm">
                    <p>
                      {problem?.solutionExplanation ||
                        "Detailed explanation of the solution approach."}
                    </p>
                  </div>
                  <div className="mt-6">
                    <h3 className="text-m font-semibold mb-2">
                      Solution Code
                    </h3>
                    <div className="bg-gray-100 dark:bg-gray-700 dark:text-gray-50 font-mono text-xs p-4 rounded-lg overflow-auto">
                      <pre>
                        {problem?.solutionCode}
                      </pre>
                    </div>
                  </div>
                  <div className="mt-6">
                    <h3 className="text-m font-semibold mb-2">
                      Complexity Analysis
                    </h3>
                    <div className="space-y-2 text-sm">
                      <p>
                        <strong>Time Complexity:</strong>{" "}
                        {problem?.timeComplexity || "O(n)"}
                      </p>
                      <p>
                        <strong>Space Complexity:</strong>{" "}
                        {problem?.spaceComplexity || "O(1)"}
                      </p>
                    </div>
                  </div>
                  <div>
                    {problem && (
                      <div className="mt-6">
                        <h3 className="text-m font-semibold mb-2">
                          Video Explanation
                        </h3>
                        <a
                          href={problem.youtubeUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 text-sm"
                        >
                          <Youtube size={20} className="mr-2" />
                          Watch tutorial on YouTube
                        </a>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="min-h-[400px]">
                  {renderSubmissionResult()}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
        <div className="lg:w-1/2">
          <div className="sticky">
            <CodeEditor language="python" onSubmitCode={onSubmitCode} />

          </div>
        </div>
      </div>
    </div>
  )
};

export default Problem;