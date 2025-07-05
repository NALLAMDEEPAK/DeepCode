import { Controller, Post, Body } from '@nestjs/common';
import { GeminiService } from './gen-questions.service';

@Controller('gemini')
export class GeminiController {
  constructor(private readonly geminiService: GeminiService) {}

  @Post('/generate')
  async generate(@Body() body: { prompt: string; model?: string }) {
    const result = await this.geminiService.generateContent(body.prompt, body.model);
    return result;
  }
}
