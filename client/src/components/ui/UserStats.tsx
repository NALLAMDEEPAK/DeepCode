import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../../contexts/authContext';
import { useProblems } from '../../contexts/problemsContext';

interface UserStatsData {
  userId: string;
  easy: number;
  medium: number;
  hard: number;
  totalSolved: number;
  attempting: number;
}

const UserStats: React.FC = () => {
  const { user } = useAuth();
  const { problems } = useProblems();
  const [stats, setStats] = useState<UserStatsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (user && problems.length > 0) {
      fetchUserStats();
    }
  }, [user, problems]);

  const fetchUserStats = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await axios.get('/user/stats');
      setStats(response.data);
    } catch (err) {
      console.error('Error fetching user stats:', err);
      // If API fails, use mock data for now
      setStats({
        userId: user?.googleId || '',
        easy: 193,
        medium: 336,
        hard: 55,
        totalSolved: 584,
        attempting: 15
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Calculate total problems from DSA list
  const getTotalProblems = () => {
    return problems.length;
  };

  // Calculate problems by difficulty from DSA list
  const getProblemsByDifficulty = () => {
    const easy = problems.filter(p => p.difficulty === 'Easy').length;
    const medium = problems.filter(p => p.difficulty === 'Medium').length;
    const hard = problems.filter(p => p.difficulty === 'Hard').length;
    return { easy, medium, hard };
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-4">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (error || !stats) {
    return (
      <div className="p-4 text-center">
        <p className="text-xs text-red-500 dark:text-red-400">Failed to load stats</p>
      </div>
    );
  }

  const totalProblems = getTotalProblems();
  const { easy: totalEasy, medium: totalMedium, hard: totalHard } = getProblemsByDifficulty();
  
  // Calculate progress percentage
  const progressPercentage = totalProblems > 0 ? (stats.totalSolved / totalProblems) * 100 : 0;
  
  // Calculate stroke dash array for circular progress
  const radius = 50;
  const circumference = 2 * Math.PI * radius;
  const strokeDasharray = circumference;
  const strokeDashoffset = circumference - (progressPercentage / 100) * circumference;

  return (
    <div className="p-4 bg-gray-800 dark:bg-gray-900 rounded-lg">
      {/* Circular Progress */}
      <div className="relative flex items-center justify-center mb-4">
        <svg className="w-32 h-32 transform -rotate-90" viewBox="0 0 120 120">
          {/* Background circle */}
          <circle
            cx="60"
            cy="60"
            r={radius}
            stroke="#374151"
            strokeWidth="6"
            fill="transparent"
            className="opacity-30"
          />
          
          {/* Progress segments */}
          {/* Easy segment (green) */}
          <circle
            cx="60"
            cy="60"
            r={radius}
            stroke="#10b981"
            strokeWidth="6"
            fill="transparent"
            strokeDasharray={`${(stats.easy / totalProblems) * circumference} ${circumference}`}
            strokeDashoffset="0"
            strokeLinecap="round"
            className="transition-all duration-500 ease-in-out"
            transform="rotate(-90 60 60)"
          />
          
          {/* Medium segment (yellow) */}
          <circle
            cx="60"
            cy="60"
            r={radius}
            stroke="#f59e0b"
            strokeWidth="6"
            fill="transparent"
            strokeDasharray={`${(stats.medium / totalProblems) * circumference} ${circumference}`}
            strokeDashoffset={`-${(stats.easy / totalProblems) * circumference}`}
            strokeLinecap="round"
            className="transition-all duration-500 ease-in-out"
            transform="rotate(-90 60 60)"
          />
          
          {/* Hard segment (red) */}
          <circle
            cx="60"
            cy="60"
            r={radius}
            stroke="#ef4444"
            strokeWidth="6"
            fill="transparent"
            strokeDasharray={`${(stats.hard / totalProblems) * circumference} ${circumference}`}
            strokeDashoffset={`-${((stats.easy + stats.medium) / totalProblems) * circumference}`}
            strokeLinecap="round"
            className="transition-all duration-500 ease-in-out"
            transform="rotate(-90 60 60)"
          />
        </svg>
        
        {/* Center content */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <div className="text-3xl font-bold text-white">
            {stats.totalSolved}
          </div>
          <div className="text-sm text-gray-400">
            /{totalProblems}
          </div>
          <div className="text-xs text-green-400 flex items-center mt-1">
            <span className="mr-1">✓</span>
            Solved
          </div>
        </div>
      </div>

      {/* Attempting indicator */}
      <div className="text-center mb-4">
        <span className="text-sm text-gray-400">
          {stats.attempting} Attempting
        </span>
      </div>

      {/* Difficulty breakdown */}
      <div className="grid grid-cols-3 gap-3">
        {/* Easy */}
        <div className="bg-gray-700 dark:bg-gray-800 rounded-lg p-3 text-center">
          <div className="text-green-400 text-sm font-medium mb-1">Easy</div>
          <div className="text-white font-bold">
            {stats.easy}/{totalEasy}
          </div>
        </div>

        {/* Medium */}
        <div className="bg-gray-700 dark:bg-gray-800 rounded-lg p-3 text-center">
          <div className="text-yellow-400 text-sm font-medium mb-1">Med.</div>
          <div className="text-white font-bold">
            {stats.medium}/{totalMedium}
          </div>
        </div>

        {/* Hard */}
        <div className="bg-gray-700 dark:bg-gray-800 rounded-lg p-3 text-center">
          <div className="text-red-400 text-sm font-medium mb-1">Hard</div>
          <div className="text-white font-bold">
            {stats.hard}/{totalHard}
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserStats;