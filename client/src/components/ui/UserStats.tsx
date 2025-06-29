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
  const radius = 45;
  const circumference = 2 * Math.PI * radius;
  const strokeDasharray = circumference;
  const strokeDashoffset = circumference - (progressPercentage / 100) * circumference;

  return (
    <div className="p-4 bg-gray-800 dark:bg-gray-900 rounded-lg">
      {/* Circular Progress */}
      <div className="relative flex items-center justify-center mb-4">
        <svg className="w-24 h-24 transform -rotate-90" viewBox="0 0 100 100">
          {/* Background circle */}
          <circle
            cx="50"
            cy="50"
            r={radius}
            stroke="currentColor"
            strokeWidth="8"
            fill="transparent"
            className="text-gray-700 dark:text-gray-600"
          />
          {/* Progress circle */}
          <circle
            cx="50"
            cy="50"
            r={radius}
            stroke="url(#gradient)"
            strokeWidth="8"
            fill="transparent"
            strokeDasharray={strokeDasharray}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            className="transition-all duration-300 ease-in-out"
          />
          {/* Gradient definition */}
          <defs>
            <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#fbbf24" />
              <stop offset="50%" stopColor="#10b981" />
              <stop offset="100%" stopColor="#ef4444" />
            </linearGradient>
          </defs>
        </svg>
        
        {/* Center content */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <div className="text-2xl font-bold text-white">
            {stats.totalSolved}
          </div>
          <div className="text-xs text-gray-400">
            /{totalProblems}
          </div>
          <div className="text-xs text-green-400 flex items-center">
            <span className="mr-1">✓</span>
            Solved
          </div>
        </div>
      </div>

      {/* Attempting indicator */}
      <div className="text-center mb-4">
        <span className="text-xs text-gray-400">
          {stats.attempting} Attempting
        </span>
      </div>

      {/* Difficulty breakdown */}
      <div className="space-y-2">
        {/* Easy */}
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <div className="w-3 h-3 bg-green-500 rounded-sm mr-2"></div>
            <span className="text-sm text-green-400">Easy</span>
          </div>
          <span className="text-sm text-white font-medium">
            {stats.easy}/{totalEasy}
          </span>
        </div>

        {/* Medium */}
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <div className="w-3 h-3 bg-yellow-500 rounded-sm mr-2"></div>
            <span className="text-sm text-yellow-400">Med.</span>
          </div>
          <span className="text-sm text-white font-medium">
            {stats.medium}/{totalMedium}
          </span>
        </div>

        {/* Hard */}
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <div className="w-3 h-3 bg-red-500 rounded-sm mr-2"></div>
            <span className="text-sm text-red-400">Hard</span>
          </div>
          <span className="text-sm text-white font-medium">
            {stats.hard}/{totalHard}
          </span>
        </div>
      </div>
    </div>
  );
};

export default UserStats;