import { Controller, Post, Body, Get, Query, HttpException, HttpStatus } from '@nestjs/common';
import { InterviewService, StudentForm } from './interview.service';

@Controller('interview')
export class InterviewController {
  constructor(private readonly interviewService: InterviewService) {}

  @Post('/generate-questions')
  async generateQuestions(@Body() studentForm: StudentForm) {
    try {
      const questions = await this.interviewService.generateQuestionsFromForm(studentForm);
      return {
        success: true,
        data: questions,
        message: 'Questions generated successfully',
        generatedAt: new Date().toISOString(),
        studentProfile: {
          name: studentForm.name,
          experience: studentForm.experience,
          difficulty: studentForm.difficulty,
          topics: studentForm.preferredTopics
        }
      };
    } catch (error) {
      throw new HttpException(
        'Failed to generate questions',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @Get('/dsa-questions')
  getDSAQuestions(
    @Query('difficulty') difficulty?: string,
    @Query('topics') topics?: string,
    @Query('count') count?: string
  ) {
    try {
      const preferences = {
        difficulty,
        topics: topics ? topics.split(',').map(t => t.trim()) : undefined,
        count: count ? parseInt(count) : undefined
      };

      const questions = this.interviewService.filterDSAQuestionsByPreferences(preferences);
      
      return {
        success: true,
        data: questions,
        total: questions.length,
        filters: preferences
      };
    } catch (error) {
      throw new HttpException(
        'Failed to fetch DSA questions',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @Get('/all-dsa-questions')
  getAllDSAQuestions() {
    try {
      const questions = this.interviewService.getExistingDSAQuestions();
      return {
        success: true,
        data: questions,
        total: questions.length
      };
    } catch (error) {
      throw new HttpException(
        'Failed to fetch all DSA questions',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @Post('/interview-session')
  createInterviewSession(@Body() sessionData: {
    interviewerId: string;
    studentId: string;
    questions: any[];
    sessionType: 'ai-generated' | 'dsa-import';
    duration: number;
  }) {
    try {
      // Here you would typically save the interview session to database
      const sessionId = `session_${Date.now()}`;
      
      return {
        success: true,
        sessionId,
        data: {
          ...sessionData,
          sessionId,
          createdAt: new Date().toISOString(),
          status: 'created'
        },
        message: 'Interview session created successfully'
      };
    } catch (error) {
      throw new HttpException(
        'Failed to create interview session',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }
}