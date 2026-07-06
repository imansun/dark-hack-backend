import { Controller, Post, Body, HttpException } from '@nestjs/common';
import { IsString, IsNotEmpty } from 'class-validator';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { AiService } from './ai.service';

class AskDto {
  @IsString()
  @IsNotEmpty()
  prompt: string;
}

@ApiTags('AI')
@Controller('api/ai')
export class AiController {
  constructor(private readonly ai: AiService) {}

  @Post('ask')
  @ApiOperation({ summary: 'Send a prompt to AI' })
  async ask(@Body() dto: AskDto) {
    try {
      const answer = await this.ai.ask(dto.prompt);
      return { answer };
    } catch (err: any) {
      throw new HttpException(err.message, 502);
    }
  }

  @Post('consult')
  @ApiOperation({ summary: 'Business consultation with AI Agent' })
  async consult(@Body() dto: AskDto) {
    try {
      const answer = await this.ai.consult(dto.prompt);
      return { answer };
    } catch (err: any) {
      throw new HttpException(err.message, 502);
    }
  }
}
