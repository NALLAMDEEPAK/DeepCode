import { Controller, Get } from '@nestjs/common';
import { createClient } from '@libsql/client';

@Controller('health')
export class HealthController {
  private readonly tursoClient;

  constructor() {
    this.tursoClient = createClient({
      url: process.env.DSA_LIST_DB ?? '',
      authToken: process.env.TURSO_AUTH_TOKEN ?? '',
    });
  }

  @Get()
  async healthCheck() {
    const timestamp = new Date().toISOString();
    
    try {
      // Test database connection
      await this.tursoClient.execute('SELECT 1');
      
      // Test interview tables
      const interviewCount = await this.tursoClient.execute('SELECT COUNT(*) as count FROM interviews');
      const sessionCount = await this.tursoClient.execute('SELECT COUNT(*) as count FROM interview_sessions');
      const questionCount = await this.tursoClient.execute('SELECT COUNT(*) as count FROM interview_questions');
      
      return {
        status: 'ok',
        timestamp,
        services: {
          database: 'connected',
          interviews: 'available',
          sessions: 'available',
          questions: 'available'
        },
        stats: {
          totalInterviews: interviewCount.rows[0]?.count || 0,
          totalSessions: sessionCount.rows[0]?.count || 0,
          totalQuestions: questionCount.rows[0]?.count || 0
        }
      };
    } catch (error) {
      console.error('Health check failed:', error);
      return {
        status: 'error',
        timestamp,
        services: {
          database: 'disconnected',
          interviews: 'unavailable',
          sessions: 'unavailable',
          questions: 'unavailable'
        },
        error: error.message
      };
    }
  }
}