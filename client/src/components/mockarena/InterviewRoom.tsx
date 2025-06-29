import React, { useState, useEffect } from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft, Code2, Play, FileText, CheckCircle, XCircle, AlertCircle, Loader2, Clock, Target, Users } from "lucide-react";
import Button from "../ui/Button";
import Badge from "../ui/Badge";
import { Card, CardContent } from "../ui/Card";
import CodeEditor from "./CodeEditor";
import axios from "axios";
import { useProblems } from "../../contexts/problemsContext";

const InterviewRoom: React.FC = () => {
  const { problems } = useProblems();
  const { id } = useParams();
  const [activeView, setActiveView] = useState<"code" | "results">("code");
  const [isLoading, setIsLoading] = useState(false);
  const [testResults, setTestResults] = useState<any>(null);
  const [currentCode, setCurrentCode] = useState("");
  const [currentLanguage, setCurrentLanguage] = useState("python");
  const [interviewQuestions, setInterviewQuestions] = useState<any>(null);
  const [interviewSession, setInterviewSession] = useState<any>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [sessionLoading, setSessionLoading] = useState(true);

  useEffect(() => {
    if (id) {
      loadInterviewData();
    }
  }, [id]);

  const loadInterviewData = async () => {
    try {
      setSessionLoading(true);
      
      // Load interview questions
      const questionsResponse = await axios.get(`/interview/${id}/questions`);
      setInterviewQuestions(questionsResponse.data);
      
      // Load interview session details
      const sessionResponse = await axios.get(`/interview/${id}/session`);
      setInterviewSession(sessionResponse.data);
      
      // Update session status to active
      await axios.put(`/interview/${id}/session/status`, { status: 'active' });
      
    } catch (error) {
      console.error('Error loading interview data:', error);
    } finally {
      setSessionLoading(false);
    }
  };

  const getCurrentQuestion = () => {
    if (!interviewQuestions) return null;
    
    const questions = interviewQuestions.questions;
    
    if (questions.type === 'dsa') {
      // Find the problem from the DSA list
      const questionId = questions.questionIds[currentQuestionIndex];
      return problems.find(p => p.id === questionId);
    } else if (questions.type === 'ai') {
      // Return AI-generated question
      return questions.questions[currentQuestionIndex];
    }
    
    return null;
  };

  const getTotalQuestions = () => {
    if (!interviewQuestions) return 0;
    
    const questions = interviewQuestions.questions;
    if (questions.type === 'dsa') {
      return questions.questionIds.length;
    } else if (questions.type === 'ai') {
      return questions.questions.length;
    }
    
    return 0;
  };

  const handleCodeChange = (code: string) => {
    setCurrentCode(code);
  };

  const handleLanguageChange = (language: string) => {
    setCurrentLanguage(language);
  };

  const handleRunCode = async () => {
    setIsLoading(true);
    setActiveView("results");
    
    try {
      const langType = {
        javascript: "js",
        python: "py",
        cpp: "cpp",
        java: "java",
      }[currentLanguage];

      const data = {
        code: currentCode,
        langType: langType,
        timeout: 2,
        inputLines: 2
      };

      const response = await axios.post('/submit-code', data);
      setTestResults(response.data);
    } catch (error) {
      console.error('Error running code:', error);
      setTestResults({
        isCompilerError: "Failed to execute code. Please try again.",
        status: 500
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex < getTotalQuestions() - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      setCurrentCode("");
      setTestResults(null);
      setActiveView("code");
    }
  };

  const handlePreviousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
      setCurrentCode("");
      setTestResults(null);
      setActiveView("code");
    }
  };

  const renderTestResults = () => {
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

    if (!testResults) {
      return (
        <div className="flex flex-col items-center justify-center py-12 text-gray-500 dark:text-gray-400">
          <Code2 className="w-12 h-12 mb-4" />
          <p>Click "Run" to test your code</p>
        </div>
      );
    }

    // Handle compiler errors
    if (testResults.isCompilerError) {
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
                {testResults.isCompilerError}
              </pre>
            </div>
          </div>
        </div>
      );
    }

    // Handle runtime errors
    if (testResults.isError) {
      return (
        <div className="space-y-6">
          <div className="flex flex-col items-center text-center py-6">
            <div className="w-16 h-16 bg-orange-100 dark:bg-orange-900/30 rounded-full flex items-center justify-center mb-4">
              <AlertCircle className="w-8 h-8 text-orange-600 dark:text-orange-400" />
            </div>
            <h3 className="text-xl font-bold text-orange-600 dark:text-orange-400 mb-2">
              Test Failed
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              Your code produced incorrect output for test case {testResults.passed + 1}
            </p>
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
                  {testResults.expected}
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
                  {testResults.actual}
                </pre>
              </div>
            </div>
          </div>

          {testResults.input && (
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
                  {testResults.input}
                </pre>
              </div>
            </div>
          )}
        </div>
      );
    }

    // Handle success
    return (
      <div className="space-y-6">
        <div className="flex flex-col items-center text-center py-8">
          <div className="relative mb-4">
            <div className="w-20 h-20 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
              <CheckCircle className="w-10 h-10 text-green-600 dark:text-green-400" />
            </div>
          </div>
          <h3 className="text-2xl font-bold text-green-600 dark:text-green-400 mb-2">
            All Tests Passed!
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
              {"<1s"}
            </p>
          </div>
          
          <div className="bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-lg p-4">
            <div className="flex items-center justify-center mb-2">
              <Code2 className="w-5 h-5 text-purple-600 dark:text-purple-400 mr-2" />
              <span className="text-sm font-medium text-purple-800 dark:text-purple-300">
                Tests Passed
              </span>
            </div>
            <p className="text-center text-lg font-bold text-purple-600 dark:text-purple-400">
              {testResults.passed || 'All'}
            </p>
          </div>
        </div>
      </div>
    );
  };

  if (sessionLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-indigo-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400">Loading interview session...</p>
        </div>
      </div>
    );
  }

  const currentQuestion = getCurrentQuestion();
  const totalQuestions = getTotalQuestions();

  if (!currentQuestion) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <Card className="max-w-md w-full">
          <CardContent className="p-6 text-center">
            <h2 className="text-xl font-semibold mb-4">No Questions Available</h2>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              This interview session doesn't have any questions configured.
            </p>
            <Button onClick={() => window.history.back()}>
              Go Back
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const difficultyVariant = currentQuestion
    ? ({
        Easy: "success",
        Medium: "warning",
        Hard: "danger",
      }[currentQuestion.difficulty] as "success" | "warning" | "danger")
    : undefined;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <Link to="/mock-arena" className="mr-4">
              <Button variant="ghost" icon={<ArrowLeft size={16} />}>
                Exit Interview
              </Button>
            </Link>
            <div>
              <h1 className="text-xl font-bold text-gray-900 dark:text-white">
                Mock Interview Room
              </h1>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {interviewSession?.interviewer_name} & {interviewSession?.candidate_email}
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Users className="w-4 h-4 text-green-500" />
              <span className="text-sm text-gray-600 dark:text-gray-400">2 participants</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-sm text-gray-600 dark:text-gray-400">Live</span>
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              Question {currentQuestionIndex + 1} of {totalQuestions}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex flex-col lg:flex-row h-[calc(100vh-80px)]">
        {/* Problem Section */}
        <div className="lg:w-1/2 flex flex-col overflow-hidden">
          <Card className="flex flex-col flex-1 m-4 overflow-hidden">
            <div className="border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between px-4 py-3">
                <div className="flex items-center">
                  <div className="flex items-center px-4 py-3 text-sm font-medium border-b-2 border-indigo-600 text-indigo-600">
                    <FileText size={16} className="mr-2" />
                    Problem
                  </div>
                </div>
                <div className="flex space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handlePreviousQuestion}
                    disabled={currentQuestionIndex === 0}
                  >
                    Previous
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleNextQuestion}
                    disabled={currentQuestionIndex === totalQuestions - 1}
                  >
                    Next
                  </Button>
                </div>
              </div>
            </div>

            <CardContent className="p-6 overflow-y-auto flex-1">
              <div className="space-y-4">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                    {currentQuestion?.title}
                  </h2>
                  {currentQuestion && (
                    <Badge variant={difficultyVariant}>
                      {currentQuestion.difficulty}
                    </Badge>
                  )}
                </div>

                <div className="flex flex-wrap gap-2 mb-4">
                  {currentQuestion?.topics?.map((topic) => (
                    <Badge key={topic} variant="primary" size="sm">
                      {topic}
                    </Badge>
                  ))}
                </div>

                <div className="prose dark:prose-invert max-w-none dark:text-white">
                  <h3 className="text-lg font-semibold mb-4">
                    Problem Statement
                  </h3>
                  <p className="text-sm leading-relaxed">{currentQuestion?.description}</p>

                  {currentQuestion?.examples && (
                    <div className="mt-6">
                      <h3 className="text-lg font-semibold mb-2">Examples</h3>
                      <div className="space-y-4">
                        {currentQuestion.examples.map((example, index) => (
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

                  {currentQuestion?.constraints && (
                    <div className="mt-6">
                      <h3 className="text-lg font-semibold mb-2">
                        Constraints
                      </h3>
                      <ul className="list-disc list-inside text-sm space-y-1">
                        {currentQuestion.constraints.map((constraint, index) => (
                          <li key={index}>{constraint}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Code Editor Section */}
        <div className="lg:w-1/2 flex flex-col overflow-hidden">
          <div className="m-4 flex flex-col flex-1">
            {/* Editor Controls */}
            <div className="bg-white dark:bg-gray-800 rounded-t-lg border border-gray-200 dark:border-gray-700 px-4 py-3">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Code Editor
                </h3>
                <div className="flex space-x-2">
                  <Button
                    variant={activeView === "code" ? "primary" : "outline"}
                    size="sm"
                    onClick={() => setActiveView("code")}
                    icon={<Code2 size={16} />}
                  >
                    Code
                  </Button>
                  <Button
                    variant={activeView === "results" ? "primary" : "outline"}
                    size="sm"
                    onClick={handleRunCode}
                    icon={<Play size={16} />}
                    isLoading={isLoading}
                  >
                    Run
                  </Button>
                </div>
              </div>
            </div>

            {/* Content Area */}
            <div className="flex-1 bg-white dark:bg-gray-800 rounded-b-lg border-l border-r border-b border-gray-200 dark:border-gray-700 overflow-hidden">
              {activeView === "code" ? (
                <div className="h-full">
                  <CodeEditor
                    language={currentLanguage}
                    onLanguageChange={handleLanguageChange}
                    onSubmitCode={(lang, code) => {
                      setCurrentLanguage(lang);
                      setCurrentCode(code);
                      handleRunCode();
                    }}
                  />
                </div>
              ) : (
                <div className="h-full overflow-y-auto p-6">
                  <div className="mb-4">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                      Test Results
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Results from running your code against test cases
                    </p>
                  </div>
                  {renderTestResults()}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InterviewRoom;