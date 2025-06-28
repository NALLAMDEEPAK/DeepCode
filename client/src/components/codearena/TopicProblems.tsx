import React, { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { ArrowLeft, SlidersHorizontal } from "lucide-react";
import Button from "../../components/ui/Button";
import ProblemCard from "./ProblemCard";
import { useProblems } from "../../contexts/problemsContext";

const TopicProblems: React.FC = () => {
  const { topic } = useParams<{ topic: string }>();
  const decodedTopic = topic ? decodeURIComponent(topic) : "";
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>("all");

  const { problems } = useProblems();

  const problemsList = problems.filter(
    (problem) =>
      problem.topics.includes(decodedTopic) &&
      (selectedDifficulty === "all" ||
        problem.difficulty === selectedDifficulty)
  );

  const totalProblems = problems.filter((problem) =>
    problem.topics.includes(decodedTopic)
  ).length;
  const difficultyCount = {
    Easy: problems.filter(
      (p) => p.topics.includes(decodedTopic) && p.difficulty === "Easy"
    ).length,
    Medium: problems.filter(
      (p) => p.topics.includes(decodedTopic) && p.difficulty === "Medium"
    ).length,
    Hard: problems.filter(
      (p) => p.topics.includes(decodedTopic) && p.difficulty === "Hard"
    ).length,
  };
  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <Link to="/">
          <Button
            variant="ghost"
            icon={<ArrowLeft size={20} />}
            className="hover:bg-white dark:hover:bg-gray-900"
          >
          </Button>
        </Link>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4 grow">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
                  {decodedTopic}
                </h1>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {totalProblems} problems available
                </p>
              </div>
            </div>
            <div className="flex items-center gap-6">
              <div className="hidden md:flex items-center gap-4 px-4 border-r border-gray-200 dark:border-gray-700">
                <div className="text-center">
                  <div className="text-sm font-medium text-green-600 dark:text-green-400">
                    {difficultyCount.Easy}
                  </div>
                  <div className="text-xs text-gray-600 dark:text-gray-400">
                    Easy
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-sm font-medium text-yellow-600 dark:text-yellow-400">
                    {difficultyCount.Medium}
                  </div>
                  <div className="text-xs text-gray-600 dark:text-gray-400">
                    Medium
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-sm font-medium text-red-600 dark:text-red-400">
                    {difficultyCount.Hard}
                  </div>
                  <div className="text-xs text-gray-600 dark:text-gray-400">
                    Hard
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <SlidersHorizontal
                  size={16}
                  className="text-gray-500 dark:text-gray-400"
                />
                <select
                  value={selectedDifficulty}
                  onChange={(e) => setSelectedDifficulty(e.target.value)}
                  className="bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 text-gray-900 dark:text-white text-sm rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 p-2.5 pr-8 appearance-none cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors duration-200"
                >
                  <option value="all">All Difficulties</option>
                  <option value="Easy">Easy</option>
                  <option value="Medium">Medium</option>
                  <option value="Hard">Hard</option>
                </select>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {problemsList.map((problem) => (
          <ProblemCard
            key={problem.id}
            problem={problem}
            topic={decodedTopic}
          />
        ))}
        {problemsList.length === 0 && (
          <div className="col-span-full text-center py-12 text-gray-500 dark:text-gray-400">
            No problems found for this topic.
          </div>
        )}
      </div>
    </div>
  );
};

export default TopicProblems;
