import React from "react";
import { Link } from "react-router-dom";
import { Youtube, ArrowRight } from "lucide-react";
import { Card, CardContent, CardFooter } from "../ui/Card";
import Badge from "../ui/Badge";
import { Problem } from "../../types";

interface ProblemCardProps {
  problem: Problem;
  topic: string;
  isSolved: boolean;
}

const ProblemCard: React.FC<ProblemCardProps> = ({ problem, topic, isSolved }) => {
  const difficultyVariant = {
    Easy: "success",
    Medium: "warning",
    Hard: "danger",
  }[problem.difficulty as "Easy" | "Medium" | "Hard"] as
    | "success"
    | "warning"
    | "danger";
  return (
<Card className="h-full flex flex-col hover:shadow-lg transition-shadow duration-200">
  <CardContent className="flex flex-col flex-grow">
    <div className="flex justify-between items-start mb-2">
      <Badge variant={difficultyVariant} size="sm">
        {problem.difficulty}
      </Badge>
      <div className="flex space-x-3">
        {problem.youtubeUrl && (
          <a
            href={problem.youtubeUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-gray-500 hover:text-red-600 dark:text-gray-400 dark:hover:text-red-400"
            aria-label="YouTube tutorial"
          >
            <Youtube size={18} />
          </a>
        )}
        {isSolved && (
                <div className="flex items-center text-sm font-medium text-green-600">
                Solved
              </div>
        )}
      </div>
    </div>
    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
      {problem.title}
    </h3>
    <div className="flex flex-wrap gap-2 mb-4">
      {problem.topics.map((subTopic) => (
        <Badge key={subTopic} variant="primary" size="sm">
          {subTopic}
        </Badge>
      ))}
    </div>
    <p className="text-sm text-gray-600 dark:text-gray-300 mb-4 line-clamp-3">
      {problem.description}
    </p>
  </CardContent>

  <CardFooter className="mt-auto">
    <Link to={`/code-arena/topic/${topic}/problem/${problem.id}`} className="w-full">
    <div className="flex items-center justify-center">
        <span className="dark:text-gray-400 mr-2 text-sm">Solve Now</span>
        <ArrowRight className="text-gray-800 dark:text-white" size={20} />
    </div>
    </Link>
  </CardFooter>
</Card>

  );
};

export default ProblemCard;
