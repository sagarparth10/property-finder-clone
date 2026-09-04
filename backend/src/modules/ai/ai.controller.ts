import { Controller, Post, Get, Body, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
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
  @ApiOperation({ summary: 'Chat with AI avatar' })
  async chat(
    @Body()
    body: {
      message: string;
      language?: string;
      history?: ChatHistoryEntry[];
    },
  ) {
    const { message, language, history = [] } = body;
    const response = await this.aiService.chat(message, language, history);
    return { response };
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

