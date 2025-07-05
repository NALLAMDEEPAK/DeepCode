import { Injectable } from '@nestjs/common';
import axios from 'axios';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class GeminiService {
  private apiKey: string;
  private baseUrl = 'https://generativelanguage.googleapis.com/v1beta/models';
  private prompt: string

  constructor(private readonly configService: ConfigService) {
    this.apiKey = 'AIzaSyBE7SZr3q7Pmr03Nx1cRumwmH4V5IdEhsw';
  }

  async generateContent(prompt: string, model: string = 'gemini-2.0-flash') {
    const url = `${this.baseUrl}/${model}:generateContent`;

    try {
      const response = await axios.post(
        url,
        {
          contents: [
            {
              parts: [{ text: prompt }],
            },
          ],
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'X-goog-api-key': this.apiKey,
          },
        },
      );

      return response.data;
    } catch (error) {
      console.error('Gemini API error:', error.response?.data || error.message);
      throw error;
    }
  }
}
