import React, { useState } from 'react';
import { Card, CardContent, CardHeader } from '../ui/Card';
import Button from '../ui/Button';
import { User, Clock, Target, Code, CheckCircle } from 'lucide-react';

interface StudentFormData {
  name: string;
  experience: string;
  skills: string[];
  preferredTopics: string[];
  difficulty: 'Easy' | 'Medium' | 'Hard';
  interviewType: 'Technical' | 'Behavioral' | 'Mixed';
  duration: number;
}

interface StudentFormProps {
  onSubmit: (formData: StudentFormData) => void;
}

const StudentForm: React.FC<StudentFormProps> = ({ onSubmit }) => {
  const [formData, setFormData] = useState<StudentFormData>({
    name: '',
    experience: '',
    skills: [],
    preferredTopics: [],
    difficulty: 'Medium',
    interviewType: 'Technical',
    duration: 60
  });

  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 4;

  const experienceLevels = [
    'Student/New Graduate',
    '0-2 years',
    '2-5 years',
    '5-10 years',
    '10+ years'
  ];

  const skillOptions = [
    'JavaScript', 'Python', 'Java', 'C++', 'C#', 'Go', 'Rust',
    'React', 'Node.js', 'Angular', 'Vue.js', 'Django', 'Flask',
    'Spring Boot', 'Express.js', 'MongoDB', 'PostgreSQL', 'MySQL',
    'AWS', 'Docker', 'Kubernetes', 'Git', 'Linux'
  ];

  const topicOptions = [
    'Arrays', 'Strings', 'Linked Lists', 'Stacks & Queues',
    'Trees & Graphs', 'Dynamic Programming', 'Greedy Algorithms',
    'Binary Search', 'Two Pointers', 'Hash Tables', 'Heaps',
    'Sorting & Searching', 'Recursion', 'Backtracking',
    'Bit Manipulation', 'Math & Geometry', 'System Design'
  ];

  const handleSkillToggle = (skill: string) => {
    setFormData(prev => ({
      ...prev,
      skills: prev.skills.includes(skill)
        ? prev.skills.filter(s => s !== skill)
        : [...prev.skills, skill]
    }));
  };

  const handleTopicToggle = (topic: string) => {
    setFormData(prev => ({
      ...prev,
      preferredTopics: prev.preferredTopics.includes(topic)
        ? prev.preferredTopics.filter(t => t !== topic)
        : [...prev.preferredTopics, topic]
    }));
  };

  const handleNext = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = () => {
    onSubmit(formData);
  };

  const isStepValid = () => {
    switch (currentStep) {
      case 1:
        return formData.name.trim() !== '' && formData.experience !== '';
      case 2:
        return formData.skills.length > 0;
      case 3:
        return formData.preferredTopics.length > 0;
      case 4:
        return true;
      default:
        return false;
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <User className="w-12 h-12 text-indigo-600 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                Basic Information
              </h2>
              <p className="text-gray-600 dark:text-gray-400">
                Let's start with some basic information about the student
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Student Name *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="Enter student's full name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Experience Level *
                </label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {experienceLevels.map(level => (
                    <button
                      key={level}
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, experience: level }))}
                      className={`p-3 text-left border rounded-lg transition-colors ${
                        formData.experience === level
                          ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-300'
                          : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500'
                      }`}
                    >
                      {level}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <Code className="w-12 h-12 text-indigo-600 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                Technical Skills
              </h2>
              <p className="text-gray-600 dark:text-gray-400">
                Select the technologies and skills the student is familiar with
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-4">
                Select Skills ({formData.skills.length} selected)
              </label>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                {skillOptions.map(skill => (
                  <button
                    key={skill}
                    type="button"
                    onClick={() => handleSkillToggle(skill)}
                    className={`p-3 text-sm border rounded-lg transition-colors ${
                      formData.skills.includes(skill)
                        ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-300'
                        : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500'
                    }`}
                  >
                    {skill}
                  </button>
                ))}
              </div>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <Target className="w-12 h-12 text-indigo-600 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                Interview Focus
              </h2>
              <p className="text-gray-600 dark:text-gray-400">
                Choose the topics and areas to focus on during the interview
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-4">
                Preferred Topics ({formData.preferredTopics.length} selected)
              </label>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {topicOptions.map(topic => (
                  <button
                    key={topic}
                    type="button"
                    onClick={() => handleTopicToggle(topic)}
                    className={`p-3 text-sm border rounded-lg transition-colors ${
                      formData.preferredTopics.includes(topic)
                        ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-300'
                        : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500'
                    }`}
                  >
                    {topic}
                  </button>
                ))}
              </div>
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <Clock className="w-12 h-12 text-indigo-600 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                Interview Settings
              </h2>
              <p className="text-gray-600 dark:text-gray-400">
                Configure the interview difficulty and duration
              </p>
            </div>

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                  Difficulty Level
                </label>
                <div className="grid grid-cols-3 gap-3">
                  {(['Easy', 'Medium', 'Hard'] as const).map(level => (
                    <button
                      key={level}
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, difficulty: level }))}
                      className={`p-4 text-center border rounded-lg transition-colors ${
                        formData.difficulty === level
                          ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-300'
                          : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500'
                      }`}
                    >
                      <div className="font-medium">{level}</div>
                      <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        {level === 'Easy' && 'Basic concepts'}
                        {level === 'Medium' && 'Intermediate problems'}
                        {level === 'Hard' && 'Advanced challenges'}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                  Interview Type
                </label>
                <div className="grid grid-cols-3 gap-3">
                  {(['Technical', 'Behavioral', 'Mixed'] as const).map(type => (
                    <button
                      key={type}
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, interviewType: type }))}
                      className={`p-4 text-center border rounded-lg transition-colors ${
                        formData.interviewType === type
                          ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-300'
                          : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500'
                      }`}
                    >
                      <div className="font-medium">{type}</div>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                  Duration (minutes)
                </label>
                <div className="grid grid-cols-4 gap-3">
                  {[30, 45, 60, 90].map(duration => (
                    <button
                      key={duration}
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, duration }))}
                      className={`p-3 text-center border rounded-lg transition-colors ${
                        formData.duration === duration
                          ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-300'
                          : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500'
                      }`}
                    >
                      {duration}m
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Interview Setup
            </h1>
            <div className="flex items-center space-x-2">
              {Array.from({ length: totalSteps }, (_, i) => (
                <div
                  key={i}
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                    i + 1 < currentStep
                      ? 'bg-green-500 text-white'
                      : i + 1 === currentStep
                      ? 'bg-indigo-600 text-white'
                      : 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
                  }`}
                >
                  {i + 1 < currentStep ? <CheckCircle size={16} /> : i + 1}
                </div>
              ))}
            </div>
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 mt-4">
            <div
              className="bg-indigo-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${(currentStep / totalSteps) * 100}%` }}
            />
          </div>
        </CardHeader>

        <CardContent className="p-8">
          {renderStep()}

          <div className="flex justify-between mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
            <Button
              variant="outline"
              onClick={handlePrevious}
              disabled={currentStep === 1}
            >
              Previous
            </Button>

            {currentStep === totalSteps ? (
              <Button
                onClick={handleSubmit}
                disabled={!isStepValid()}
              >
                Create Interview
              </Button>
            ) : (
              <Button
                onClick={handleNext}
                disabled={!isStepValid()}
              >
                Next
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default StudentForm;