import { Controller, Get } from '@nestjs/common';
import { createClient } from '@libsql/client';

@Controller('health')
export class HealthController {
  private readonly tursoClient;

  constructor() {
    this.tursoClient = createClient({
      url: 'libsql://dsalist-deepak135.aws-ap-south-1.turso.io',
      authToken: process.env.TURSO_AUTH_TOKEN ?? 
        'eyJhbGciOiJFZERTQSIsInR5cCI6IkpXVCJ9.eyJhIjoicnciLCJnaWQiOiI1ZDc3YWM3Ni1hZmRlLTQ0ZWEtYTEyNC1iOTJjYzMyODA3MzgiLCJpYXQiOjE3NTA1NzMxNjQsInJpZCI6IjAwN2Y5NjUxLWZkYTktNGUwYy05OTExLWM5YmEyM2QyMGFhMSJ9.AMM6zUmyipvN1EIQEKpyqQFCgaqI7Ff9fNGD9EZvypFsODGl4AcqLGVF3YbgvuxrHO8jRGt8nZSe5ou3hw-kDQ',
    });
  }

  @Get()
  async healthCheck() {
    const timestamp = new Date().toISOString();
    
    try {
      // Test database connection
      await this.tursoClient.execute('SELECT 1');
      
      // Test interview table
      const interviewCount = await this.tursoClient.execute('SELECT COUNT(*) as count FROM interviews');
      
      return {
        status: 'ok',
        timestamp,
        services: {
          database: 'connected',
          interviews: 'available'
        },
        stats: {
          totalInterviews: interviewCount.rows[0]?.count || 0
        }
      };
    } catch (error) {
      console.error('Health check failed:', error);
      return {
        status: 'error',
        timestamp,
        services: {
          database: 'disconnected',
          interviews: 'unavailable'
        },
        error: error.message
      };
    }
  }
}