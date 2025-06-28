import React, { useEffect, useState } from "react";
import { FileCode2, Network } from 'lucide-react';
import Button from "../ui/Button";
import Badge from "../ui/Badge";
import { Card, CardContent } from "../ui/Card";
import DsaTopics from "./DsaTopics";
import { useProblems } from "../../contexts/problemsContext";

const CodeArena: React.FC = () => {
  const { problems } = useProblems();

  const topics:string[] = Array.from(new Set(problems.flatMap((problem) => problem.topics)));

    const upcomingFeatures = [
    {
        id: 1,
        title: "System Design Masterclass",
        description:
        "Learn to design scalable systems with real-world case studies and expert guidance.",
        icon: Network,
        date: "Coming March 2025",
        tag: "New Course",
    },
    {
        id: 2,
        title: "Advanced Algorithms",
        description:
        "Deep dive into complex algorithms and competitive programming techniques.",
        icon: FileCode2,
        date: "Coming May 2025",
        tag: "Featured",
    },
    ];

    return (
      <div className="space-y-8">
        <div className="space-y-4">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">
            Coming Soon
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {upcomingFeatures.map((feature) => (
              <Card
                key={feature.id}
                className="bg-gradient-to-br from-purple-500 to-indigo-600 text-white"
              >
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <feature.icon className="h-8 w-8" />
                    <Badge
                      variant="primary"
                      className="bg-white/20 text-white border-0"
                    >
                      {feature.tag}
                    </Badge>
                  </div>
                  <h3 className="text-xl font-semibold mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-white/80 mb-4">{feature.description}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-white/80">
                      {feature.date}
                    </span>
                    <Button
                      variant="outline"
                      className="bg-white/10 border-white/20 text-white hover:bg-white/20"
                    >
                      Get Notified
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
        
        <DsaTopics topics={topics} />
      </div>
    );
};

export default CodeArena;