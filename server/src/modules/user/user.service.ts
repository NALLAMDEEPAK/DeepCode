import { Injectable } from '@nestjs/common';
import { createClient } from '@libsql/client';

export interface UserStats {
  userId: string;
  easy: number;
  medium: number;
  hard: number;
  totalSolved: number;
  attempting: number;
}

@Injectable()
export class UserService {
  private readonly tursoClient;

  constructor() {
    this.tursoClient = createClient({
      url: 'libsql://userdata-deepak135.aws-ap-south-1.turso.io',
      authToken: process.env.TURSO_AUTH_TOKEN ?? 
        'eyJhbGciOiJFZERTQSIsInR5cCI6IkpXVCJ9.eyJhIjoicnciLCJnaWQiOiI1ZDc3YWM3Ni1hZmRlLTQ0ZWEtYTEyNC1iOTJjYzMyODA3MzgiLCJpYXQiOjE3NTA1NzMxNjQsInJpZCI6IjAwN2Y5NjUxLWZkYTktNGUwYy05OTExLWM5YmEyM2QyMGFhMSJ9.AMM6zUmyipvN1EIQEKpyqQFCgaqI7Ff9fNGD9EZvypFsODGl4AcqLGVF3YbgvuxrHO8jRGt8nZSe5ou3hw-kDQ',
    });
    this.initializeDatabase();
  }

  private async initializeDatabase() {
    try {
      await this.tursoClient.execute(`
        CREATE TABLE IF NOT EXISTS user_stats (
          user_id TEXT PRIMARY KEY,
          easy INTEGER DEFAULT 0,
          medium INTEGER DEFAULT 0,
          hard INTEGER DEFAULT 0,
          total_solved INTEGER DEFAULT 0,
          attempting INTEGER DEFAULT 0,
          created_at TEXT DEFAULT CURRENT_TIMESTAMP,
          updated_at TEXT DEFAULT CURRENT_TIMESTAMP
        )
      `);
      console.log('✅ User stats table initialized successfully');
    } catch (error) {
      console.error('❌ Failed to initialize user stats table:', error);
    }
  }

  async getUserStats(userId: string): Promise<UserStats> {
    try {
      // Try to get existing stats
      const result = await this.tursoClient.execute({
        sql: 'SELECT * FROM user_stats WHERE user_id = ?',
        args: [userId]
      });

      if (result.rows.length > 0) {
        const row = result.rows[0] as any;
        return {
          userId: row.user_id,
          easy: row.easy || 0,
          medium: row.medium || 0,
          hard: row.hard || 0,
          totalSolved: row.total_solved || 0,
          attempting: row.attempting || 0,
        };
      } else {
        // Create new user stats with default values
        const defaultStats = {
          userId,
          easy: 193,
          medium: 336,
          hard: 55,
          totalSolved: 584,
          attempting: 15,
        };

        await this.tursoClient.execute({
          sql: `
            INSERT INTO user_stats (user_id, easy, medium, hard, total_solved, attempting)
            VALUES (?, ?, ?, ?, ?, ?)
          `,
          args: [
            userId,
            defaultStats.easy,
            defaultStats.medium,
            defaultStats.hard,
            defaultStats.totalSolved,
            defaultStats.attempting
          ]
        });

        return defaultStats;
      }
    } catch (error) {
      console.error('Error fetching user stats:', error);
      // Return default stats if database fails
      return {
        userId,
        easy: 193,
        medium: 336,
        hard: 55,
        totalSolved: 584,
        attempting: 15,
      };
    }
  }

  async updateUserStats(userId: string, stats: Partial<UserStats>): Promise<void> {
    try {
      await this.tursoClient.execute({
        sql: `
          UPDATE user_stats 
          SET easy = ?, medium = ?, hard = ?, total_solved = ?, attempting = ?, updated_at = CURRENT_TIMESTAMP
          WHERE user_id = ?
        `,
        args: [
          stats.easy || 0,
          stats.medium || 0,
          stats.hard || 0,
          stats.totalSolved || 0,
          stats.attempting || 0,
          userId
        ]
      });
    } catch (error) {
      console.error('Error updating user stats:', error);
      throw error;
    }
  }
}