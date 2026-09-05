import { Controller, Post, Get, Body, Param, Res, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { Response } from 'express';
import { AIService } from './ai.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

type ChatHistoryEntry = {
  role: 'assistant' | 'user';
  content: string;
};

@ApiTags('ai')
@Controller('ai')
export class AIController {
  constructor(private readonly aiService: AIService) {}

  @Post('chat')
  @ApiOperation({ summary: 'Chat with AI avatar (SSE stream by default)' })
  async chat(
    @Body()
    body: {
      message: string;
      language?: string;
      history?: ChatHistoryEntry[];
      stream?: boolean;
    },
    @Res({ passthrough: false }) res: Response,
  ) {
    const { message, language, history = [], stream = true } = body;

    if (stream === false) {
      const response = await this.aiService.chat(message, language, history);
      return res.json({ response });
    }

    res.setHeader('Content-Type', 'text/event-stream; charset=utf-8');
    res.setHeader('Cache-Control', 'no-cache, no-transform');
    res.setHeader('Connection', 'keep-alive');
    res.setHeader('X-Accel-Buffering', 'no');
    res.flushHeaders?.();

    await this.aiService.chatStream(message, language, history, (token) => {
      res.write(`data: ${JSON.stringify({ content: token })}\n\n`);
    });
    res.write(`data: ${JSON.stringify({ done: true })}\n\n`);
    res.end();
  }

  @Get('recommendations/:userId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get AI-powered property recommendations' })
  async getRecommendations(@Param('userId') userId: string) {
    return this.aiService.getPropertyRecommendations(userId, {});
  }

  @Post('generate-description')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Generate property description using AI' })
  async generateDescription(@Body() propertyData: any) {
    return {
      description: await this.aiService.generatePropertyDescription(propertyData),
    };
  }
}
