import React, { useState } from 'react';
import { Card, CardContent, CardHeader } from '../ui/Card';
import Button from '../ui/Button';
import Badge from '../ui/Badge';
import { Bot, FileText, Clock, Users, Target, Brain, CheckCircle, AlertCircle } from 'lucide-react';
import axios from 'axios';

interface StudentForm {
  name: string;
  experience: string;
  skills: string[];
  preferredTopics: string[];
  difficulty: 'Easy' | 'Medium' | 'Hard';
  interviewType: 'Technical' | 'Behavioral' | 'Mixed';
  duration: number;
}

interface InterviewSetupProps {
  studentForm: StudentForm;
  onQuestionsSelected: (questions: any[], type: 'ai-generated' | 'dsa-import') => void;
}

const InterviewSetup: React.FC<InterviewSetupProps> = ({ studentForm, onQuestionsSelected }) => {
  const [selectedOption, setSelectedOption] = useState<'ai' | 'dsa' | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [dsaQuestions, setDsaQuestions] = useState<any[]>([]);
  const [selectedDsaQuestions, setSelectedDsaQuestions] = useState<string[]>([]);
  const [dsaFilters, setDsaFilters] = useState({
    difficulty: 'Mixed',
    topics: [] as string[],
    count: 5
  });
  const [error, setError] = useState<string>('');

  const availableTopics = [
    'Array', 'String', 'Linked List', 'Stack', 'Queue', 'Tree', 'Graph',
    'Dynamic Programming', 'Greedy', 'Binary Search', 'Two Pointers',
    'Hash Table', 'Heap', 'Sorting', 'Math', 'Bit Manipulation'
  ];

  const handleGenerateAIQuestions = async () => {
    setIsGenerating(true);
    setError('');
    
    try {
      const response = await axios.post('http://localhost:8000/interview/generate-questions', studentForm);
      
      if (response.data.success) {
        onQuestionsSelected(response.data.data, 'ai-generated');
      } else {
        setError('Failed to generate questions. Please try again.');
      }
    } catch (error) {
      console.error('Error generating questions:', error);
      setError('Failed to generate questions. Please check your connection and try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleLoadDSAQuestions = async () => {
    try {
      const params = new URLSearchParams();
      if (dsaFilters.difficulty !== 'Mixed') {
        params.append('difficulty', dsaFilters.difficulty);
      }
      if (dsaFilters.topics.length > 0) {
        params.append('topics', dsaFilters.topics.join(','));
      }
      params.append('count', dsaFilters.count.toString());

      const response = await axios.get(`http://localhost:8000/interview/dsa-questions?${params}`);
      
      if (response.data.success) {
        setDsaQuestions(response.data.data);
        setSelectedDsaQuestions(response.data.data.map((q: any) => q.id));
      }
    } catch (error) {
      console.error('Error loading DSA questions:', error);
      setError('Failed to load DSA questions.');
    }
  };

  const handleSelectDSAQuestions = () => {
    const selected = dsaQuestions.filter(q => selectedDsaQuestions.includes(q.id));
    onQuestionsSelected(selected, 'dsa-import');
  };

  const toggleDsaQuestion = (questionId: string) => {
    setSelectedDsaQuestions(prev => 
      prev.includes(questionId) 
        ? prev.filter(id => id !== questionId)
        : [...prev, questionId]
    );
  };

  const toggleTopic = (topic: string) => {
    setDsaFilters(prev => ({
      ...prev,
      topics: prev.topics.includes(topic)
        ? prev.topics.filter(t => t !== topic)
        : [...prev.topics, topic]
    }));
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Student Profile Summary */}
      <Card>
        <CardHeader>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center">
            <Users className="mr-2" size={20} />
            Student Profile
          </h2>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Name</p>
              <p className="font-medium text-gray-900 dark:text-white">{studentForm.name}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Experience</p>
              <p className="font-medium text-gray-900 dark:text-white">{studentForm.experience}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Difficulty</p>
              <Badge variant={studentForm.difficulty === 'Easy' ? 'success' : studentForm.difficulty === 'Medium' ? 'warning' : 'danger'}>
                {studentForm.difficulty}
              </Badge>
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Duration</p>
              <p className="font-medium text-gray-900 dark:text-white flex items-center">
                <Clock size={16} className="mr-1" />
                {studentForm.duration} min
              </p>
            </div>
          </div>
          <div className="mt-4">
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Preferred Topics</p>
            <div className="flex flex-wrap gap-2">
              {studentForm.preferredTopics.map(topic => (
                <Badge key={topic} variant="primary" size="sm">{topic}</Badge>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
          <div className="flex items-center">
            <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 mr-2" />
            <p className="text-red-700 dark:text-red-300">{error}</p>
          </div>
        </div>
      )}

      {/* Question Source Selection */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* AI Generated Questions */}
        <Card className={`cursor-pointer transition-all duration-200 ${selectedOption === 'ai' ? 'ring-2 ring-indigo-500 bg-indigo-50 dark:bg-indigo-900/20' : 'hover:shadow-lg'}`}>
          <CardContent className="p-6">
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <Bot className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                AI Generated Questions
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                Let AI create personalized questions based on the student's profile and preferences
              </p>
              <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400 mb-6">
                <div className="flex items-center justify-center">
                  <Brain className="w-4 h-4 mr-2" />
                  Tailored to student's skill level
                </div>
                <div className="flex items-center justify-center">
                  <Target className="w-4 h-4 mr-2" />
                  Focuses on preferred topics
                </div>
                <div className="flex items-center justify-center">
                  <Clock className="w-4 h-4 mr-2" />
                  Optimized for interview duration
                </div>
              </div>
              <Button
                variant="primary"
                onClick={() => {
                  setSelectedOption('ai');
                  handleGenerateAIQuestions();
                }}
                isLoading={isGenerating}
                className="w-full"
              >
                {isGenerating ? 'Generating Questions...' : 'Generate AI Questions'}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Import DSA Questions */}
        <Card className={`cursor-pointer transition-all duration-200 ${selectedOption === 'dsa' ? 'ring-2 ring-indigo-500 bg-indigo-50 dark:bg-indigo-900/20' : 'hover:shadow-lg'}`}>
          <CardContent className="p-6">
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-teal-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <FileText className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                Import DSA Questions
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                Choose from our curated collection of Data Structures and Algorithms questions
              </p>
              <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400 mb-6">
                <div className="flex items-center justify-center">
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Proven interview questions
                </div>
                <div className="flex items-center justify-center">
                  <Target className="w-4 h-4 mr-2" />
                  Filter by difficulty & topics
                </div>
                <div className="flex items-center justify-center">
                  <FileText className="w-4 h-4 mr-2" />
                  Complete solutions included
                </div>
              </div>
              <Button
                variant="success"
                onClick={() => {
                  setSelectedOption('dsa');
                  handleLoadDSAQuestions();
                }}
                className="w-full"
              >
                Browse DSA Questions
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* DSA Questions Selection */}
      {selectedOption === 'dsa' && (
        <Card>
          <CardHeader>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Select DSA Questions
            </h3>
          </CardHeader>
          <CardContent>
            {/* Filters */}
            <div className="space-y-4 mb-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Difficulty
                  </label>
                  <select
                    value={dsaFilters.difficulty}
                    onChange={(e) => setDsaFilters(prev => ({ ...prev, difficulty: e.target.value }))}
                    className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                  >
                    <option value="Mixed">Mixed</option>
                    <option value="Easy">Easy</option>
                    <option value="Medium">Medium</option>
                    <option value="Hard">Hard</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Max Questions
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="10"
                    value={dsaFilters.count}
                    onChange={(e) => setDsaFilters(prev => ({ ...prev, count: parseInt(e.target.value) }))}
                    className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                  />
                </div>
                <div className="flex items-end">
                  <Button onClick={handleLoadDSAQuestions} className="w-full">
                    Apply Filters
                  </Button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Topics
                </label>
                <div className="flex flex-wrap gap-2">
                  {availableTopics.map(topic => (
                    <button
                      key={topic}
                      onClick={() => toggleTopic(topic)}
                      className={`px-3 py-1 rounded-full text-sm transition-colors ${
                        dsaFilters.topics.includes(topic)
                          ? 'bg-indigo-600 text-white'
                          : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
                      }`}
                    >
                      {topic}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Questions List */}
            {dsaQuestions.length > 0 && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium text-gray-900 dark:text-white">
                    Available Questions ({dsaQuestions.length})
                  </h4>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setSelectedDsaQuestions(dsaQuestions.map(q => q.id))}
                    >
                      Select All
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setSelectedDsaQuestions([])}
                    >
                      Clear All
                    </Button>
                  </div>
                </div>

                <div className="max-h-96 overflow-y-auto space-y-2">
                  {dsaQuestions.map(question => (
                    <div
                      key={question.id}
                      className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                        selectedDsaQuestions.includes(question.id)
                          ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20'
                          : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                      }`}
                      onClick={() => toggleDsaQuestion(question.id)}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h5 className="font-medium text-gray-900 dark:text-white">
                              {question.title}
                            </h5>
                            <Badge
                              variant={
                                question.difficulty === 'Easy' ? 'success' :
                                question.difficulty === 'Medium' ? 'warning' : 'danger'
                              }
                              size="sm"
                            >
                              {question.difficulty}
                            </Badge>
                          </div>
                          <p className="text-sm text-gray-600 dark:text-gray-400 mb-2 line-clamp-2">
                            {question.description}
                          </p>
                          <div className="flex flex-wrap gap-1">
                            {question.topics.map((topic: string) => (
                              <Badge key={topic} variant="primary" size="sm">
                                {topic}
                              </Badge>
                            ))}
                          </div>
                        </div>
                        <div className="ml-4">
                          <input
                            type="checkbox"
                            checked={selectedDsaQuestions.includes(question.id)}
                            onChange={() => toggleDsaQuestion(question.id)}
                            className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="flex justify-end pt-4">
                  <Button
                    onClick={handleSelectDSAQuestions}
                    disabled={selectedDsaQuestions.length === 0}
                  >
                    Use Selected Questions ({selectedDsaQuestions.length})
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default InterviewSetup;