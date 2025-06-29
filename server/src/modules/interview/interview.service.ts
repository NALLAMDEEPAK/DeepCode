import { Injectable } from '@nestjs/common';
import { EmailService, InterviewInvitation } from '../email/email.service';

export interface ScheduleInterviewDto {
  recipientEmail: string;
  recipientName?: string;
  date: string;
  time: string;
  duration: number;
  topics: string;
  description?: string;
}

@Injectable()
export class InterviewService {
  constructor(private readonly emailService: EmailService) {}

  async scheduleInterview(scheduleData: ScheduleInterviewDto) {
    try {
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

      // Prepare invitation data
      const invitation: InterviewInvitation = {
        recipientEmail: scheduleData.recipientEmail,
        recipientName,
        senderName: 'DeepCode User', // You can get this from the authenticated user
        interviewDate: formattedDate,
        interviewTime: formattedTime,
        duration: scheduleData.duration,
        topics: scheduleData.topics,
        description: scheduleData.description,
      };

      // Send email invitation
      const emailSent = await this.emailService.sendInterviewInvitation(invitation);

      if (emailSent) {
        return {
          success: true,
          message: `Interview invitation sent successfully to ${scheduleData.recipientEmail}`,
          interviewDetails: {
            date: formattedDate,
            time: formattedTime,
            duration: scheduleData.duration,
            topics: scheduleData.topics,
          }
        };
      } else {
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
}