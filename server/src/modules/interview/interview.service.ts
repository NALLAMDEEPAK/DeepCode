import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { GoogleGenerativeAI } from '@google/generative-ai';

export interface StudentForm {
  name: string;
  experience: string;
  skills: string[];
  preferredTopics: string[];
  difficulty: 'Easy' | 'Medium' | 'Hard';
  interviewType: 'Technical' | 'Behavioral' | 'Mixed';
  duration: number;
}

export interface GeneratedQuestion {
  id: string;
  title: string;
  description: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  topics: string[];
  hints?: string[];
  followUpQuestions?: string[];
  expectedApproach?: string;
  timeComplexity?: string;
  spaceComplexity?: string;
}

@Injectable()
export class InterviewService {
  private genAI: GoogleGenerativeAI;

  constructor() {
    this.genAI = new GoogleGenerativeAI('AIzaSyBE7SZr3q7Pmr03Nx1cRumwmH4V5IdEhsw');
  }

  async generateQuestionsFromForm(studentForm: StudentForm): Promise<GeneratedQuestion[]> {
    try {
      const model = this.genAI.getGenerativeModel({ model: 'gemini-pro' });

      const prompt = this.buildPrompt(studentForm);
      
      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();

      return this.parseGeneratedQuestions(text);
    } catch (error) {
      console.error('Error generating questions with Gemini:', error);
      throw new HttpException('Failed to generate questions', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  private buildPrompt(form: StudentForm): string {
    return `
You are an expert technical interviewer. Generate ${form.interviewType === 'Mixed' ? '3-5' : '2-4'} coding interview questions based on the following candidate profile:

**Candidate Profile:**
- Name: ${form.name}
- Experience Level: ${form.experience}
- Technical Skills: ${form.skills.join(', ')}
- Preferred Topics: ${form.preferredTopics.join(', ')}
- Difficulty Level: ${form.difficulty}
- Interview Type: ${form.interviewType}
- Duration: ${form.duration} minutes

**Requirements:**
1. Generate questions that match the ${form.difficulty} difficulty level
2. Focus on topics: ${form.preferredTopics.join(', ')}
3. Consider the candidate's experience level: ${form.experience}
4. Questions should be solvable within ${Math.floor(form.duration / 3)}-${Math.floor(form.duration / 2)} minutes each
5. Include a mix of algorithmic and problem-solving questions

**Response Format (JSON):**
Return a valid JSON array with the following structure for each question:
[
  {
    "id": "unique_id",
    "title": "Question Title",
    "description": "Detailed problem description with examples and constraints",
    "difficulty": "Easy|Medium|Hard",
    "topics": ["topic1", "topic2"],
    "hints": ["hint1", "hint2"],
    "followUpQuestions": ["follow-up question 1"],
    "expectedApproach": "Brief description of expected solution approach",
    "timeComplexity": "O(n)",
    "spaceComplexity": "O(1)"
  }
]

Generate questions that are:
- Relevant to the candidate's skill level
- Progressively challenging
- Include real-world problem-solving scenarios
- Have clear examples and constraints
- Suitable for a ${form.duration}-minute interview session

Please provide only the JSON response without any additional text or formatting.
    `;
  }

  private parseGeneratedQuestions(text: string): GeneratedQuestion[] {
    try {
      // Clean the response text
      let cleanText = text.trim();
      
      // Remove markdown code blocks if present
      if (cleanText.startsWith('```json')) {
        cleanText = cleanText.replace(/```json\n?/, '').replace(/\n?```$/, '');
      } else if (cleanText.startsWith('```')) {
        cleanText = cleanText.replace(/```\n?/, '').replace(/\n?```$/, '');
      }

      const questions = JSON.parse(cleanText);
      
      // Validate and ensure proper structure
      return questions.map((q: any, index: number) => ({
        id: q.id || `generated_${Date.now()}_${index}`,
        title: q.title || `Generated Question ${index + 1}`,
        description: q.description || 'No description provided',
        difficulty: q.difficulty || 'Medium',
        topics: Array.isArray(q.topics) ? q.topics : ['General'],
        hints: Array.isArray(q.hints) ? q.hints : [],
        followUpQuestions: Array.isArray(q.followUpQuestions) ? q.followUpQuestions : [],
        expectedApproach: q.expectedApproach || '',
        timeComplexity: q.timeComplexity || 'O(n)',
        spaceComplexity: q.spaceComplexity || 'O(1)'
      }));
    } catch (error) {
      console.error('Error parsing generated questions:', error);
      console.log('Raw response:', text);
      
      // Fallback: return a default question if parsing fails
      return [{
        id: `fallback_${Date.now()}`,
        title: 'Two Sum Problem',
        description: 'Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target.',
        difficulty: 'Easy' as const,
        topics: ['Array', 'Hash Table'],
        hints: ['Use a hash map to store seen numbers', 'Look for complement of current number'],
        followUpQuestions: ['What if there are multiple solutions?', 'How would you handle duplicates?'],
        expectedApproach: 'Use hash map for O(n) solution',
        timeComplexity: 'O(n)',
        spaceComplexity: 'O(n)'
      }];
    }
  }

  // Get existing DSA questions from your mock data
  getExistingDSAQuestions(): any[] {
    // This would typically come from your database
    // For now, we'll return the mock problems
    const mockProblems = [
      {
        id: '1',
        title: 'Two Sum',
        difficulty: 'Easy',
        topics: ['Array', 'Hash Table'],
        description: 'Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target.',
        youtubeUrl: 'https://www.youtube.com/watch?v=KLlXCFG5TnA',
        starterCode: 'function twoSum(nums, target) {\n  // Your code here\n}',
        solutionCode: 'function twoSum(nums, target) {\n  const map = new Map();\n  \n  for (let i = 0; i < nums.length; i++) {\n    const complement = target - nums[i];\n    \n    if (map.has(complement)) {\n      return [map.get(complement), i];\n    }\n    \n    map.set(nums[i], i);\n  }\n  \n  return [];\n}',
        solutionExplanation: 'We can use a hash map to store the numbers we\'ve seen so far and their indices. For each number, we calculate its complement (target - current number) and check if it exists in our hash map. If it does, we\'ve found our pair.',
        timeComplexity: 'O(n)',
        spaceComplexity: 'O(n)',
        examples: [
          {
            input: 'nums = [2,7,11,15], target = 9',
            output: '[0,1]',
            explanation: 'Because nums[0] + nums[1] == 9, we return [0, 1].'
          }
        ],
        constraints: [
          '2 <= nums.length <= 10^4',
          '-10^9 <= nums[i] <= 10^9',
          'Only one valid answer exists.'
        ]
      },
      {
        id: '2',
        title: 'Valid Parentheses',
        difficulty: 'Easy',
        topics: ['Stack', 'String'],
        description: 'Given a string s containing just the characters \'(\', \')\', \'{\', \'}\', \'[\' and \']\', determine if the input string is valid.',
        youtubeUrl: 'https://www.youtube.com/watch?v=WTzjTskDFMg',
        examples: [
          {
            input: 's = "()"',
            output: 'true'
          },
          {
            input: 's = "()[]{}"',
            output: 'true'
          },
          {
            input: 's = "(]"',
            output: 'false'
          }
        ]
      },
      {
        id: '3',
        title: 'Maximum Subarray',
        difficulty: 'Medium',
        topics: ['Array', 'Dynamic Programming', 'Divide and Conquer'],
        description: 'Given an integer array nums, find the contiguous subarray (containing at least one number) which has the largest sum and return its sum.',
        youtubeUrl: 'https://www.youtube.com/watch?v=5WZl3MMT0Eg'
      },
      {
        id: '4',
        title: 'Trapping Rain Water',
        difficulty: 'Hard',
        topics: ['Array', 'Two Pointers', 'Dynamic Programming', 'Stack'],
        description: 'Given n non-negative integers representing an elevation map where the width of each bar is 1, compute how much water it can trap after raining.',
        youtubeUrl: 'https://www.youtube.com/watch?v=ZI2z5pq0TqA'
      }
    ];

    return mockProblems;
  }

  filterDSAQuestionsByPreferences(preferences: {
    difficulty?: string;
    topics?: string[];
    count?: number;
  }): any[] {
    let questions = this.getExistingDSAQuestions();

    // Filter by difficulty
    if (preferences.difficulty && preferences.difficulty !== 'Mixed') {
      questions = questions.filter(q => q.difficulty === preferences.difficulty);
    }

    // Filter by topics
    if (preferences.topics && preferences.topics.length > 0) {
      questions = questions.filter(q => 
        q.topics.some((topic: string) => 
          preferences.topics!.some(prefTopic => 
            topic.toLowerCase().includes(prefTopic.toLowerCase())
          )
        )
      );
    }

    // Limit count
    if (preferences.count) {
      questions = questions.slice(0, preferences.count);
    }

    return questions;
  }
}