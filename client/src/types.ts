export interface Problem {
    id: string;
    title: string;
    description: string;
    difficulty: "Easy" | "Medium" | "Hard";
    topics: string[];
    youtubeUrl?: string;
    starterCode?: string;
    solutionCode?: string;
    solutionExplanation?: string;
    timeComplexity?: string;
    spaceComplexity?: string;
    examples?: {
        input: string;
        output: string;
        explanation?: string;
    }[];
    constraints?: string[];
}