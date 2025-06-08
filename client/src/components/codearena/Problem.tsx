import React, { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { mockProblems } from "../../data/mockData";
import Button from "../ui/Button";
import { ArrowLeft, Code2, FileText, Youtube } from "lucide-react";
import Badge from "../ui/Badge";
import { Card, CardContent } from "../ui/Card";
import CodeEditor from "./CodeEditor";

const Problem = () => {
  const { topic, id } = useParams();
  const [activeTab, setActiveTab] = useState<"problem" | "solution">("problem");
  const [problem, setProblem] = useState(mockProblems.find((p) => p.id === id));

  useEffect(() => {
    setProblem(mockProblems.find((p) => p.id === id));
  }, [id]);

  const difficultyVariant = problem
    ? ({
        Easy: "success",
        Medium: "warning",
        Hard: "danger",
      }[problem.difficulty] as "success" | "warning" | "danger")
    : undefined;

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
              ) : (
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
              )}
            </CardContent>
          </Card>
        </div>
        <div className="lg:w-1/2">
          <div className="sticky">
            <CodeEditor language="python" />

          </div>
        </div>
      </div>
    </div>
  )
};

export default Problem;