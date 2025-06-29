import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { EmailService, InterviewInvitation } from '../email/email.service';
import { createClient } from '@libsql/client';
import { v4 as uuidv4 } from 'uuid';

export interface ScheduleInterviewDto {
  recipientEmail: string;
  recipientName?: string;
  date: string;
  time: string;
  duration: number;
  topics: string;
  description?: string;
}

export interface AcceptInvitationDto {
  interviewId: string;
  questionSelectionType: 'dsa' | 'ai';
  selectedQuestions?: string[];
  aiPrompt?: string;
  topics?: string[];
}

export interface CancelInvitationDto {
  interviewId: string;
  reason?: string;
}

export interface InterviewRecord {
  id: string;
  interviewer_email: string;
  interviewer_name: string;
  participant_email: string;
  participant_name: string;
  scheduled_at: string;
  duration_minutes: number;
  topics: string;
  description?: string;
  status: 'pending' | 'accepted' | 'cancelled' | 'completed';
  questions?: string;
  question_type?: 'dsa' | 'ai';
  invitation_token: string;
  created_at: string;
  updated_at: string;
}

@Injectable()
export class InterviewService {
  private readonly tursoClient;

  constructor(private readonly emailService: EmailService) {
    this.tursoClient = createClient({
      url: 'libsql://dsalist-deepak135.aws-ap-south-1.turso.io',
      authToken: process.env.TURSO_AUTH_TOKEN ?? 
        'eyJhbGciOiJFZERTQSIsInR5cCI6IkpXVCJ9.eyJhIjoicnciLCJnaWQiOiI1ZDc3YWM3Ni1hZmRlLTQ0ZWEtYTEyNC1iOTJjYzMyODA3MzgiLCJpYXQiOjE3NTA1NzMxNjQsInJpZCI6IjAwN2Y5NjUxLWZkYTktNGUwYy05OTExLWM5YmEyM2QyMGFhMSJ9.AMM6zUmyipvN1EIQEKpyqQFCgaqI7Ff9fNGD9EZvypFsODGl4AcqLGVF3YbgvuxrHO8jRGt8nZSe5ou3hw-kDQ',
    });
    this.initializeDatabase();
  }

  private async initializeDatabase() {
    try {
      await this.tursoClient.execute(`
        CREATE TABLE IF NOT EXISTS interviews (
          id TEXT PRIMARY KEY,
          interviewer_email TEXT NOT NULL,
          interviewer_name TEXT NOT NULL,
          participant_email TEXT NOT NULL,
          participant_name TEXT NOT NULL,
          scheduled_at TEXT NOT NULL,
          duration_minutes INTEGER NOT NULL,
          topics TEXT,
          description TEXT,
          status TEXT DEFAULT 'pending',
          questions TEXT,
          question_type TEXT,
          invitation_token TEXT UNIQUE NOT NULL,
          created_at TEXT DEFAULT CURRENT_TIMESTAMP,
          updated_at TEXT DEFAULT CURRENT_TIMESTAMP
        )
      `);
      console.log('✅ Interview table initialized successfully');
    } catch (error) {
      console.error('❌ Failed to initialize interview table:', error);
    }
  }

  async scheduleInterview(scheduleData: ScheduleInterviewDto, user: any) {
    try {
      // Generate unique IDs
      const interviewId = uuidv4();
      const invitationToken = uuidv4();

      // Extract name from email if not provided
      const recipientName = scheduleData.recipientName || 
        scheduleData.recipientEmail.split('@')[0]
          .split('.')
          .map(part => part.charAt(0).toUpperCase() + part.slice(1))
          .join(' ');

      // Format date and time
      const interviewDateTime = new Date(`${scheduleData.date}T${scheduleData.time}`);
      const formattedDate = interviewDateTime.toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
      const formattedTime = interviewDateTime.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit'
      });

      // Save interview to database
      await this.tursoClient.execute({
        sql: `
          INSERT INTO interviews (
            id, interviewer_email, interviewer_name, participant_email, 
            participant_name, scheduled_at, duration_minutes, topics, 
            description, invitation_token
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `,
        args: [
          interviewId,
          user.email,
          `${user.firstName} ${user.lastName}`,
          scheduleData.recipientEmail,
          recipientName,
          interviewDateTime.toISOString(),
          scheduleData.duration,
          scheduleData.topics,
          scheduleData.description || '',
          invitationToken
        ]
      });

      // Prepare invitation data
      const invitation: InterviewInvitation = {
        recipientEmail: scheduleData.recipientEmail,
        recipientName,
        senderName: `${user.firstName} ${user.lastName}`,
        interviewDate: formattedDate,
        interviewTime: formattedTime,
        duration: scheduleData.duration,
        topics: scheduleData.topics,
        description: scheduleData.description,
        meetingLink: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/interview/invitation/${invitationToken}`
      };

      // Send email invitation
      const emailSent = await this.emailService.sendInterviewInvitation(invitation);

      if (emailSent) {
        return {
          success: true,
          message: `Interview invitation sent successfully to ${scheduleData.recipientEmail}`,
          interviewId,
          invitationToken,
          interviewDetails: {
            date: formattedDate,
            time: formattedTime,
            duration: scheduleData.duration,
            topics: scheduleData.topics,
          }
        };
      } else {
        // Clean up database record if email failed
        await this.tursoClient.execute({
          sql: 'DELETE FROM interviews WHERE id = ?',
          args: [interviewId]
        });
        
        return {
          success: false,
          message: 'Failed to send interview invitation. Please try again.',
        };
      }
    } catch (error) {
      console.error('Error scheduling interview:', error);
      return {
        success: false,
        message: 'An error occurred while scheduling the interview.',
      };
    }
  }

  async acceptInvitation(acceptData: AcceptInvitationDto, user: any) {
    try {
      // Get interview details
      const interview = await this.getInterviewById(acceptData.interviewId);
      if (!interview) {
        throw new NotFoundException('Interview not found');
      }

      if (interview.status !== 'pending') {
        throw new BadRequestException('Interview invitation has already been processed');
      }

      let questions = '';
      
      if (acceptData.questionSelectionType === 'dsa') {
        // Handle DSA question selection
        if (!acceptData.selectedQuestions || acceptData.selectedQuestions.length === 0) {
          throw new BadRequestException('Please select at least one question');
        }
        questions = JSON.stringify({
          type: 'dsa',
          questionIds: acceptData.selectedQuestions
        });
      } else if (acceptData.questionSelectionType === 'ai') {
        // Handle AI question generation
        const aiQuestions = await this.generateAIQuestions(
          acceptData.aiPrompt || interview.topics,
          acceptData.topics || []
        );
        questions = JSON.stringify({
          type: 'ai',
          questions: aiQuestions
        });
      }

      // Update interview status and questions
      await this.tursoClient.execute({
        sql: `
          UPDATE interviews 
          SET status = 'accepted', questions = ?, question_type = ?, updated_at = CURRENT_TIMESTAMP
          WHERE id = ?
        `,
        args: ['accepted', questions, acceptData.questionSelectionType, acceptData.interviewId]
      });

      // Send confirmation email to interviewer
      await this.emailService.sendAcceptanceNotification({
        interviewerEmail: interview.interviewer_email,
        interviewerName: interview.interviewer_name,
        participantName: user.firstName + ' ' + user.lastName,
        interviewDate: new Date(interview.scheduled_at).toLocaleDateString(),
        interviewTime: new Date(interview.scheduled_at).toLocaleTimeString(),
        interviewLink: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/mock-arena/room/${acceptData.interviewId}`
      });

      return {
        success: true,
        message: 'Interview invitation accepted successfully',
        interviewId: acceptData.interviewId,
        redirectUrl: `/mock-arena/room/${acceptData.interviewId}`
      };
    } catch (error) {
      console.error('Error accepting invitation:', error);
      throw error;
    }
  }

  async cancelInvitation(cancelData: CancelInvitationDto, user: any) {
    try {
      // Get interview details
      const interview = await this.getInterviewById(cancelData.interviewId);
      if (!interview) {
        throw new NotFoundException('Interview not found');
      }

      // Update interview status
      await this.tursoClient.execute({
        sql: `
          UPDATE interviews 
          SET status = 'cancelled', updated_at = CURRENT_TIMESTAMP
          WHERE id = ?
        `,
        args: [cancelData.interviewId]
      });

      // Send cancellation email to interviewer
      await this.emailService.sendCancellationNotification({
        interviewerEmail: interview.interviewer_email,
        interviewerName: interview.interviewer_name,
        participantName: user.firstName + ' ' + user.lastName,
        interviewDate: new Date(interview.scheduled_at).toLocaleDateString(),
        interviewTime: new Date(interview.scheduled_at).toLocaleTimeString(),
        reason: cancelData.reason || 'No reason provided'
      });

      return {
        success: true,
        message: 'Interview invitation cancelled successfully'
      };
    } catch (error) {
      console.error('Error cancelling invitation:', error);
      throw error;
    }
  }

  async getInterviewById(id: string): Promise<InterviewRecord | null> {
    try {
      const result = await this.tursoClient.execute({
        sql: 'SELECT * FROM interviews WHERE id = ?',
        args: [id]
      });

      if (result.rows.length === 0) {
        return null;
      }

      return result.rows[0] as any;
    } catch (error) {
      console.error('Error fetching interview:', error);
      return null;
    }
  }

  async getInvitationByToken(token: string): Promise<InterviewRecord | null> {
    try {
      const result = await this.tursoClient.execute({
        sql: 'SELECT * FROM interviews WHERE invitation_token = ?',
        args: [token]
      });

      if (result.rows.length === 0) {
        return null;
      }

      return result.rows[0] as any;
    } catch (error) {
      console.error('Error fetching invitation:', error);
      return null;
    }
  }

  private async generateAIQuestions(prompt: string, topics: string[]): Promise<any[]> {
    // Simulate AI question generation
    // In a real implementation, you would call an AI service like OpenAI
    const sampleQuestions = [
      {
        id: 'ai_1',
        title: 'Two Sum Variation',
        difficulty: 'Medium',
        description: 'Given an array of integers and a target sum, find all unique pairs that sum to the target.',
        topics: topics.length > 0 ? topics : ['Array', 'Hash Table']
      },
      {
        id: 'ai_2',
        title: 'Binary Tree Traversal',
        difficulty: 'Medium',
        description: 'Implement in-order traversal of a binary tree without using recursion.',
        topics: topics.length > 0 ? topics : ['Tree', 'Stack']
      },
      {
        id: 'ai_3',
        title: 'Dynamic Programming Challenge',
        difficulty: 'Hard',
        description: 'Find the longest increasing subsequence in an array.',
        topics: topics.length > 0 ? topics : ['Dynamic Programming', 'Array']
      }
    ];

    return sampleQuestions;
  }
}