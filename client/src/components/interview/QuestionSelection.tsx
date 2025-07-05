import React, { useState, useEffect, use } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Search, Brain, List, CheckCircle, ArrowRight, Sparkles, Calendar, Clock } from 'lucide-react';
import { useInterview } from '../../contexts/interviewContext';
import { useProblems } from '../../contexts/problemsContext';
import Button from '../ui/Button';
import { Card, CardContent, CardHeader } from '../ui/Card';
import Badge from '../ui/Badge';
import LoadingSpinner from '../auth/LoadingSpinner';
import axios from 'axios';
import { AiQuestions } from '../../types';

const QuestionSelection: React.FC = () => {
  const { interviewId } = useParams<{ interviewId: string }>();
  const navigate = useNavigate();
  const { currentInvitation, acceptInvitation, isLoading } = useInterview();
  const { problems } = useProblems();

  const [aiProblems, setAiProblems] = useState<AiQuestions[]>();

  const [selectionType, setSelectionType] = useState<'dsa' | 'ai' | null>(null);
  const [selectedQuestions, setSelectedQuestions] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [difficultyFilter, setDifficultyFilter] = useState<string>('all');
  const [topicFilter, setTopicFilter] = useState<string>('all');
  const [aiPrompt, setAiPrompt] = useState('');
  const [aiTopics, setAiTopics] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);

  const allTopics = (currentInvitation?.topics)?.split(',').map(topic => topic.trim()) || [];

  const filteredProblems = problems.filter(problem => {
    const matchesSearch = problem.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         problem.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDifficulty = difficultyFilter === 'all' || problem.difficulty === difficultyFilter;
    const matchesTopic = topicFilter === 'all' || problem.topics.includes(topicFilter);
    
    return matchesSearch && matchesDifficulty && matchesTopic;
  });

  const handleQuestionToggle = (questionId: string) => {
    setSelectedQuestions(prev => 
      prev.includes(questionId)
        ? prev.filter(id => id !== questionId)
        : [...prev, questionId]
    );
  };

  const query = `
Generate a list of 10 unique coding problems based on arrays — 3 from Easy, 4 from Medium, and 3 from Hard levels. Ensure **no problem repeats from the last 5 problems previously generated**.

From these 10:
- 5 should be inspired by classic FAANG interview problems.
- 5 should be from highly rated LeetCode array problems (but not the same ones used previously).

Don't include the below questions in the output:

${localStorage.getItem('aiQuestions')}

Strictly return this JSON format for each problem:
{
  "problemId": "<unique string>",
  "title": "<problem title>",
  "difficulty": "<difficulty level>",
  "description": "<problem statement>",
  "inputFormat": "<input format>",
  "outputFormat": "<output format>",
  "constraints": "<constraints>",
  "sampleInput": "<sample input>",
  "sampleOutput": "<sample output>",
  "testcases": "<five test cases in CodeChef format — include number of test cases as the first input line. Inputs and outputs should be space separated.>",
  "outputs": "<five outputs corresponding to the test cases>"
}

**Rules:**
- No repetition of problem statements from the last 5 generated problems.
- Do not explain anything — return only JSON.
- All testcases should cover possible edge cases.
- Testcases should follow CodeChef style: first line number of test cases, then subsequent inputs.
- Do not wrap the JSON in code fences.
- Problems should be of varied types: sorting, prefix sums, sliding windows, searching, etc.

Return the JSON list of exactly 10 problems as described.

`

  const getQuestions = async () => {
    if (!interviewId || !selectionType) return;

    try {
      setSubmitting(true);

      const data = await axios.post('/gemini/generate', {
        prompt: query}
      )
      const dirtyJson = data.data.candidates[0].content.parts[0].text;
      const cleanJson = dirtyJson.replace(/^```json\n/, '').replace(/\n```$/, '');
      const questionsList: AiQuestions[] = JSON.parse(cleanJson)
      console.log(questionsList)

      const titles = questionsList.map(q => q.title);
      localStorage.setItem('aiQuestions', JSON.stringify(titles));
      console.log(localStorage.getItem('aiQuestions'));

      setAiProblems(questionsList);
    } catch (error) {
      console.error('Error accepting invitation:', error);
    } finally {
      setSubmitting(false);
    }
  };

  useEffect(() => {
    console.log('Selected Questions:', selectedQuestions);
  },selectedQuestions);  
  const handleAiSubmit = async () => {
    if (!interviewId || !selectionType) return;
    try{
      setSubmitting(true);
      const acceptData = {
        interviewId,
        selectedQuestions: aiProblems?.map(problem => problem.problemId) || []
      };

      await acceptInvitation(acceptData);
      setShowConfirmation(true);
    }
    catch (error) {
      console.error('Error accepting invitation:', error);
    } finally {
      setSubmitting(false);
    }
  }

  const handleSubmit = async () => {
    if (!interviewId || !selectionType) return;

    try {
      setSubmitting(true);
      
      const acceptData = {
        interviewId,
        selectedQuestions
      };

      await acceptInvitation(acceptData);
      setShowConfirmation(true);
    } catch (error) {
      console.error('Error accepting invitation:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleConfirmationClose = () => {
    setShowConfirmation(false);
    navigate('/mock-arena');
  };

  const formatDateTime = (dateTime: string) => {
    const date = new Date(dateTime);
    return {
      date: date.toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      }),
      time: date.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit'
      })
    };
  };

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (!currentInvitation) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="max-w-md w-full">
          <CardContent className="p-6 text-center">
            <h2 className="text-xl font-semibold mb-4">Interview Not Found</h2>
            <Button onClick={() => navigate('/mock-arena')}>
              Go to Mock Arena
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const { date, time } = formatDateTime(currentInvitation.scheduled_at);

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Prepare Interview Questions
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Choose how you'd like to prepare questions for your interview with{' '}
          <span className="font-semibold">{currentInvitation.interviewer_name}</span>
        </p>
        
        {/* Interview Details Summary */}
        <div className="mt-4 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg p-4 inline-block">
          <div className="flex items-center space-x-6 text-sm">
            <div className="flex items-center">
              <Calendar className="w-4 h-4 text-indigo-600 mr-2" />
              <span className="text-indigo-800 dark:text-indigo-300">{date}</span>
            </div>
            <div className="flex items-center">
              <Clock className="w-4 h-4 text-indigo-600 mr-2" />
              <span className="text-indigo-800 dark:text-indigo-300">{time}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Selection Type */}
      {!selectionType && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card 
            className="cursor-pointer hover:shadow-lg transition-all duration-200 border-2 hover:border-indigo-500"
            onClick={() => setSelectionType('dsa')}
          >
            <CardContent className="p-8 text-center">
              <List className="w-16 h-16 text-indigo-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                Select from DSA List
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                Choose specific problems from our curated collection of data structures and algorithms questions.
              </p>
              <div className="flex justify-center">
                <Badge variant="primary">{problems.length} Questions Available</Badge>
              </div>
            </CardContent>
          </Card>

          <Card 
            className="cursor-pointer hover:shadow-lg transition-all duration-200 border-2 hover:border-purple-500"
            onClick={() => setSelectionType('ai')}
          >
            <CardContent className="p-8 text-center">
              <Brain className="w-16 h-16 text-purple-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                Generate with AI
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                Let AI create custom interview questions based on specific topics and difficulty levels.
              </p>
              <div className="flex justify-center">
                <Badge variant="primary" className="bg-purple-100 text-purple-800">
                  <Sparkles className="w-3 h-3 mr-1" />
                  AI Powered
                </Badge>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* DSA Selection */}
      {selectionType === 'dsa' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">
              Select Questions from DSA List
            </h2>
            <Button variant="outline" onClick={() => setSelectionType(null)}>
              Change Selection Type
            </Button>
          </div>

          {/* Filters */}
          <Card>
            <CardContent className="p-4">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Search
                  </label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <input
                      type="text"
                      placeholder="Search questions..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 pr-4 py-2 w-full border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Difficulty
                  </label>
                  <select
                    value={difficultyFilter}
                    onChange={(e) => setDifficultyFilter(e.target.value)}
                    className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  >
                    <option value="all">All Difficulties</option>
                    <option value="Easy">Easy</option>
                    <option value="Medium">Medium</option>
                    <option value="Hard">Hard</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Topic
                  </label>
                  <select
                    value={topicFilter}
                    onChange={(e) => setTopicFilter(e.target.value)}
                    className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  >
                    <option value="all">All Topics</option>
                    {allTopics.map(topic => (
                      <option key={topic} value={topic}>{topic}</option>
                    ))}
                  </select>
                </div>

                <div className="flex items-end">
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    {selectedQuestions.length} selected
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Questions List */}
          <div className="grid grid-cols-1 gap-4 max-h-96 overflow-y-auto">
            {filteredProblems.map(problem => {
              const isSelected = selectedQuestions.includes(problem.id);
              const difficultyVariant = {
                Easy: 'success',
                Medium: 'warning',
                Hard: 'danger',
              }[problem.difficulty] as 'success' | 'warning' | 'danger';

              return (
                <Card 
                  key={problem.id}
                  className={`cursor-pointer transition-all duration-200 ${
                    isSelected 
                      ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20' 
                      : 'hover:shadow-md'
                  }`}
                  onClick={() => handleQuestionToggle(problem.id)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <h3 className="font-semibold text-gray-900 dark:text-white">
                            {problem.title}
                          </h3>
                          <Badge variant={difficultyVariant} size="sm">
                            {problem.difficulty}
                          </Badge>
                          {isSelected && (
                            <CheckCircle className="w-5 h-5 text-indigo-600" />
                          )}
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                          {problem.description.substring(0, 150)}...
                        </p>
                        <div className="flex flex-wrap gap-1">
                          {problem.topics.map(topic => (
                            <Badge key={topic} variant="primary" size="sm">
                              {topic}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Submit Button */}
          <div className="flex justify-end">
            <Button
              onClick={handleSubmit}
              disabled={selectedQuestions.length === 0 || submitting}
              isLoading={submitting}
              icon={<ArrowRight size={16} />}
              className="bg-indigo-600 hover:bg-indigo-700"
            >
              Accept Invitation ({selectedQuestions.length} questions)
            </Button>
          </div>
        </div>
      )}

      {/* AI Generation */}
      {selectionType === 'ai' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">
              Generate Questions with AI
            </h2>
            <Button variant="outline" onClick={() => setSelectionType(null)}>
              Change Selection Type
            </Button>
          </div>

          <Card>
            <CardContent className="space-y-6">

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Topics Scope
                </label>
                <div className="flex flex-wrap gap-2">
                  {allTopics.map(topic => {
                    return (
                      <div
                        key={topic}
                        className={`px-3 py-1 rounded-full text-sm transition-colors 
                            'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
                        }`}
                      >
                        {topic}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Preview */}
              <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg">
                <h4 className="font-medium text-purple-800 dark:text-purple-300 mb-2">
                  AI will generate questions based on:
                </h4>
                <ul className="text-sm text-purple-700 dark:text-purple-400 space-y-1">
                  <li>• Interview duration: {currentInvitation.duration_minutes} minutes</li>
                  <li>• Original topics: {currentInvitation.topics}</li>
                  {aiTopics.length > 0 && (
                    <li>• Selected topics: {aiTopics.join(', ')}</li>
                  )}
                  {aiPrompt && (
                    <li>• Custom requirements: {aiPrompt.substring(0, 100)}...</li>
                  )}
                </ul>
              </div>

              {/* Submit Button */}
              <div className="flex justify-end">
                <Button
                  onClick={getQuestions}
                  isLoading={submitting}
                  icon={<Sparkles size={16} />}
                  className="bg-purple-600 hover:bg-purple-700"
                >
                  Generate Questions
                </Button>
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 gap-4 max-h-96 overflow-y-auto">
            {aiProblems?.map(problem => {
              const isSelected = selectedQuestions.includes(problem.problemId);
              const difficultyVariant = {
                Easy: 'success',
                Medium: 'warning',
                Hard: 'danger',
              }[problem.difficulty] as 'success' | 'warning' | 'danger';

              return (
                <Card 
                  key={problem.problemId}
                  className={`cursor-pointer transition-all duration-200 ${
                    isSelected 
                      ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20' 
                      : 'hover:shadow-md'
                  }`}
                  onClick={() => handleQuestionToggle(problem.problemId)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <h3 className="font-semibold text-gray-900 dark:text-white">
                            {problem.title}
                          </h3>
                          <Badge variant={difficultyVariant} size="sm">
                            {problem.difficulty}
                          </Badge>
                          {isSelected && (
                            <CheckCircle className="w-5 h-5 text-indigo-600" />
                          )}
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                          {problem.description.substring(0, 150)}...
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          <div className="flex justify-end">
            <Button
              onClick={handleAiSubmit}
              disabled={selectedQuestions.length === 0 || submitting}
              isLoading={submitting}
              icon={<ArrowRight size={16} />}
              className="bg-indigo-600 hover:bg-indigo-700"
            >
              Accept Invitation ({selectedQuestions.length} questions)
            </Button>
          </div>
        </div>
      )}

      {/* Confirmation Modal */}
      {showConfirmation && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <Card className="max-w-md w-full">
            <CardContent className="p-6 text-center">
              <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                Questions Successfully Added!
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                Your interview questions have been prepared and saved. You can now leave the platform until your scheduled interview time.
              </p>
              <div className="space-y-3">
                <Button
                  onClick={handleConfirmationClose}
                  variant="primary"
                  className="w-full"
                >
                  Return to Dashboard
                </Button>
                <Button
                  onClick={() => navigate(`/mock-arena/room/${interviewId}`)}
                  variant="outline"
                  className="w-full"
                >
                  Go to Interview Room
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default QuestionSelection;