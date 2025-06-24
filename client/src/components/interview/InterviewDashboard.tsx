import React, { useState } from 'react';
import StudentForm from './StudentForm';
import InterviewSetup from './InterviewSetup';
import { Card, CardContent } from '../ui/Card';
import { CheckCircle, Clock, Users, Target } from 'lucide-react';

interface StudentFormData {
  name: string;
  experience: string;
  skills: string[];
  preferredTopics: string[];
  difficulty: 'Easy' | 'Medium' | 'Hard';
  interviewType: 'Technical' | 'Behavioral' | 'Mixed';
  duration: number;
}

const InterviewDashboard: React.FC = () => {
  const [currentStep, setCurrentStep] = useState<'form' | 'setup' | 'session'>('form');
  const [studentForm, setStudentForm] = useState<StudentFormData | null>(null);
  const [selectedQuestions, setSelectedQuestions] = useState<any[]>([]);
  const [questionType, setQuestionType] = useState<'ai-generated' | 'dsa-import' | null>(null);

  const handleFormSubmit = (formData: StudentFormData) => {
    setStudentForm(formData);
    setCurrentStep('setup');
  };

  const handleQuestionsSelected = (questions: any[], type: 'ai-generated' | 'dsa-import') => {
    setSelectedQuestions(questions);
    setQuestionType(type);
    setCurrentStep('session');
  };

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 'form':
        return <StudentForm onSubmit={handleFormSubmit} />;
      
      case 'setup':
        return studentForm ? (
          <InterviewSetup
            studentForm={studentForm}
            onQuestionsSelected={handleQuestionsSelected}
          />
        ) : null;
      
      case 'session':
        return (
          <div className="max-w-6xl mx-auto">
            <Card>
              <CardContent className="p-8">
                <div className="text-center">
                  <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                    Interview Session Ready!
                  </h2>
                  <p className="text-gray-600 dark:text-gray-400 mb-8">
                    Your interview session has been created successfully with {selectedQuestions.length} questions.
                  </p>

                  <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                    <div className="text-center">
                      <Users className="w-8 h-8 text-indigo-600 mx-auto mb-2" />
                      <div className="text-sm text-gray-600 dark:text-gray-400">Student</div>
                      <div className="font-medium text-gray-900 dark:text-white">
                        {studentForm?.name}
                      </div>
                    </div>
                    <div className="text-center">
                      <Target className="w-8 h-8 text-indigo-600 mx-auto mb-2" />
                      <div className="text-sm text-gray-600 dark:text-gray-400">Questions</div>
                      <div className="font-medium text-gray-900 dark:text-white">
                        {selectedQuestions.length} {questionType === 'ai-generated' ? 'AI Generated' : 'DSA'}
                      </div>
                    </div>
                    <div className="text-center">
                      <Clock className="w-8 h-8 text-indigo-600 mx-auto mb-2" />
                      <div className="text-sm text-gray-600 dark:text-gray-400">Duration</div>
                      <div className="font-medium text-gray-900 dark:text-white">
                        {studentForm?.duration} minutes
                      </div>
                    </div>
                    <div className="text-center">
                      <Target className="w-8 h-8 text-indigo-600 mx-auto mb-2" />
                      <div className="text-sm text-gray-600 dark:text-gray-400">Difficulty</div>
                      <div className="font-medium text-gray-900 dark:text-white">
                        {studentForm?.difficulty}
                      </div>
                    </div>
                  </div>

                  <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-6 mb-8">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                      Selected Questions Preview
                    </h3>
                    <div className="space-y-3">
                      {selectedQuestions.slice(0, 3).map((question, index) => (
                        <div key={question.id || index} className="text-left">
                          <div className="font-medium text-gray-900 dark:text-white">
                            {index + 1}. {question.title}
                          </div>
                          <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                            {question.description?.substring(0, 100)}...
                          </div>
                        </div>
                      ))}
                      {selectedQuestions.length > 3 && (
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          ... and {selectedQuestions.length - 3} more questions
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex justify-center space-x-4">
                    <button
                      onClick={() => setCurrentStep('form')}
                      className="px-6 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                    >
                      Start New Interview
                    </button>
                    <button className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors">
                      Start Interview Session
                    </button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        );
      
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="container mx-auto px-4">
        {renderCurrentStep()}
      </div>
    </div>
  );
};

export default InterviewDashboard;