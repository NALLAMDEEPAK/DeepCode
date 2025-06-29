import { Injectable } from '@nestjs/common';
import * as nodemailer from 'nodemailer';

export interface InterviewInvitation {
  recipientEmail: string;
  recipientName: string;
  senderName: string;
  interviewDate: string;
  interviewTime: string;
  duration: number;
  topics: string;
  description?: string;
  meetingLink?: string;
}

export interface AcceptanceNotification {
  interviewerEmail: string;
  interviewerName: string;
  participantName: string;
  interviewDate: string;
  interviewTime: string;
  interviewLink: string;
}

export interface CancellationNotification {
  interviewerEmail: string;
  interviewerName: string;
  participantName: string;
  interviewDate: string;
  interviewTime: string;
  reason: string;
}

@Injectable()
export class EmailService {
  private transporter: nodemailer.Transporter;

  constructor() {
    // Configure your email service (Gmail, SendGrid, etc.)
    this.transporter = nodemailer.createTransporter({
      service: 'gmail', // or your preferred email service
      auth: {
        user: process.env.EMAIL_USER, // Your email
        pass: process.env.EMAIL_PASSWORD, // Your app password
      },
    });
  }

  async sendInterviewInvitation(invitation: InterviewInvitation): Promise<boolean> {
    try {
      const emailTemplate = this.generateInvitationTemplate(invitation);
      
      const mailOptions = {
        from: process.env.EMAIL_USER,
        to: invitation.recipientEmail,
        subject: `🎯 Mock Interview Invitation - ${invitation.interviewDate}`,
        html: emailTemplate,
      };

      await this.transporter.sendMail(mailOptions);
      console.log(`Interview invitation sent to ${invitation.recipientEmail}`);
      return true;
    } catch (error) {
      console.error('Failed to send interview invitation:', error);
      return false;
    }
  }

  async sendAcceptanceNotification(notification: AcceptanceNotification): Promise<boolean> {
    try {
      const emailTemplate = this.generateAcceptanceTemplate(notification);
      
      const mailOptions = {
        from: process.env.EMAIL_USER,
        to: notification.interviewerEmail,
        subject: `✅ Interview Accepted - ${notification.participantName}`,
        html: emailTemplate,
      };

      await this.transporter.sendMail(mailOptions);
      console.log(`Acceptance notification sent to ${notification.interviewerEmail}`);
      return true;
    } catch (error) {
      console.error('Failed to send acceptance notification:', error);
      return false;
    }
  }

  async sendCancellationNotification(notification: CancellationNotification): Promise<boolean> {
    try {
      const emailTemplate = this.generateCancellationTemplate(notification);
      
      const mailOptions = {
        from: process.env.EMAIL_USER,
        to: notification.interviewerEmail,
        subject: `❌ Interview Cancelled - ${notification.participantName}`,
        html: emailTemplate,
      };

      await this.transporter.sendMail(mailOptions);
      console.log(`Cancellation notification sent to ${notification.interviewerEmail}`);
      return true;
    } catch (error) {
      console.error('Failed to send cancellation notification:', error);
      return false;
    }
  }

  private generateInvitationTemplate(invitation: InterviewInvitation): string {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
          .details { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; }
          .button { display: inline-block; background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
          .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🎯 Mock Interview Invitation</h1>
            <p>You're invited to a coding interview practice session!</p>
          </div>
          
          <div class="content">
            <p>Hi <strong>${invitation.recipientName}</strong>,</p>
            
            <p><strong>${invitation.senderName}</strong> has invited you to a mock interview session on DeepCode platform.</p>
            
            <div class="details">
              <h3>📅 Interview Details</h3>
              <ul>
                <li><strong>Date:</strong> ${invitation.interviewDate}</li>
                <li><strong>Time:</strong> ${invitation.interviewTime}</li>
                <li><strong>Duration:</strong> ${invitation.duration} minutes</li>
                <li><strong>Topics:</strong> ${invitation.topics || 'General Programming'}</li>
              </ul>
              
              ${invitation.description ? `<p><strong>Description:</strong> ${invitation.description}</p>` : ''}
            </div>
            
            <div style="text-align: center;">
              <a href="${invitation.meetingLink}" class="button">
                View Invitation
              </a>
            </div>
            
            <p><strong>What to expect:</strong></p>
            <ul>
              <li>Real-time collaborative coding environment</li>
              <li>Practice with data structures and algorithms</li>
              <li>Improve your technical interview skills</li>
              <li>Get feedback on your problem-solving approach</li>
            </ul>
            
            <p>Click "View Invitation" to accept or decline this invitation. Make sure to join a few minutes early to test your setup. Good luck! 🚀</p>
          </div>
          
          <div class="footer">
            <p>This invitation was sent through DeepCode - Your Coding Interview Platform</p>
            <p>If you didn't expect this invitation, you can safely ignore this email.</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  private generateAcceptanceTemplate(notification: AcceptanceNotification): string {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
          .details { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; }
          .button { display: inline-block; background: #10b981; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
          .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>✅ Interview Accepted!</h1>
            <p>Great news! Your interview invitation has been accepted.</p>
          </div>
          
          <div class="content">
            <p>Hi <strong>${notification.interviewerName}</strong>,</p>
            
            <p><strong>${notification.participantName}</strong> has accepted your mock interview invitation!</p>
            
            <div class="details">
              <h3>📅 Interview Details</h3>
              <ul>
                <li><strong>Date:</strong> ${notification.interviewDate}</li>
                <li><strong>Time:</strong> ${notification.interviewTime}</li>
                <li><strong>Participant:</strong> ${notification.participantName}</li>
              </ul>
            </div>
            
            <div style="text-align: center;">
              <a href="${notification.interviewLink}" class="button">
                Join Interview Room
              </a>
            </div>
            
            <p>The interview questions have been prepared and the session is ready to begin. You can join the interview room at the scheduled time using the link above.</p>
            
            <p>Good luck with your interview session! 🚀</p>
          </div>
          
          <div class="footer">
            <p>This notification was sent through DeepCode - Your Coding Interview Platform</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  private generateCancellationTemplate(notification: CancellationNotification): string {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
          .details { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; }
          .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>❌ Interview Cancelled</h1>
            <p>Your interview invitation has been declined.</p>
          </div>
          
          <div class="content">
            <p>Hi <strong>${notification.interviewerName}</strong>,</p>
            
            <p>Unfortunately, <strong>${notification.participantName}</strong> has cancelled the mock interview scheduled for <strong>${notification.interviewDate}</strong> at <strong>${notification.interviewTime}</strong>.</p>
            
            <div class="details">
              <h3>📝 Reason for Cancellation</h3>
              <p><em>"${notification.reason}"</em></p>
            </div>
            
            <p>Don't worry! You can always schedule another interview session with different participants. Keep practicing and improving your interview skills!</p>
            
            <p>Feel free to schedule another session anytime. 💪</p>
          </div>
          
          <div class="footer">
            <p>This notification was sent through DeepCode - Your Coding Interview Platform</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }
}