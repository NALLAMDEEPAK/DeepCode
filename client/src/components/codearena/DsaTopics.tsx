import React, { useState } from "react";
import { mockProblems } from "../../data/mockData";
import { Card, CardContent } from "../ui/Card";
import { Search } from "lucide-react";
import { Link } from "react-router-dom";

interface Topics {
  topics: string[];
}

const DsaTopics: React.FC<Topics> = ({ topics }) => {
  const [searchTerm, setSearchTerm] = useState("");

  const filteredTopics = topics.filter((topic) =>
    topic.toLowerCase().includes(searchTerm.toLowerCase())
  );
  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white">
          DSA Topics
        </h2>
        <div className="relative flex-grow max-w-md">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Search topics..."
            aria-label="Search topics"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 pr-4 py-2 w-full bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-lg border border-gray-300 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredTopics.map((topic) => {
          const topicProblems = mockProblems.filter((problem) =>
            problem.topics.includes(topic)
          );
          const easyCount = topicProblems.filter(
            (problem) => problem.difficulty === "Easy"
          ).length;
          const mediumCount = topicProblems.filter(
            (problem) => problem.difficulty === "Medium"
          ).length;
          const hardCount = topicProblems.filter(
            (problem) => problem.difficulty === "Hard"
          ).length;
          return (
            <div key={topic}>
              <Link to={`/code-arena/topic/${encodeURIComponent(topic)}`}>
                <Card className="h-full hover:shadow-lg transition-shadow duration-200">
                  <CardContent className="p-6">
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                      {topic}
                    </h3>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-green-600 dark:text-green-400">
                          Easy: {easyCount}
                        </span>
                        <span className="text-yellow-600 dark:text-yellow-400">
                          Medium: {mediumCount}
                        </span>
                        <span className="text-red-600 dark:text-red-400">
                          Hard: {hardCount}
                        </span>
                      </div>
                    </div>
                    <div className="flex gap-1 h-1">
                      <div
                        className="bg-green-500 rounded-l"
                        style={{
                          width: `${
                            (topicProblems.length > 0
                              ? (easyCount / topicProblems.length) * 100
                              : 0) * 100
                          }%`,
                        }}
                      ></div>
                      <div
                        className="bg-yellow-500"
                        style={{
                          width: `${
                            (topicProblems.length > 0
                              ? (mediumCount / topicProblems.length) * 100
                              : 0) * 100
                          }%`,
                        }}
                      ></div>
                      <div
                        className="bg-red-500 rounded-r"
                        style={{
                          width: `${
                            (topicProblems.length > 0
                              ? (hardCount / topicProblems.length) * 100
                              : 0) * 100
                          }%`,
                        }}
                      ></div>
                    </div>

                    <div className="mt-4 text-sm text-gray-600 dark:text-gray-400">
                      {topicProblems.length} problems
                    </div>
                  </CardContent>
                </Card>
              </Link>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default DsaTopics;
