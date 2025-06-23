import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ParseIntPipe,
} from '@nestjs/common';
import { EvaluationService } from './evaluation.service';
import { CreateEvaluationDto } from './dtos/create-evaluation.dto';
import { UpdateEvaluationDto } from './dtos/update-evaluation.dto';
import { Evaluation } from '@prisma/client';

@Controller('evaluations')
export class EvaluationController {
  constructor(private readonly evaluationService: EvaluationService) {}

  @Post()
  async create(@Body() createEvaluationDto: CreateEvaluationDto): Promise<Evaluation> {
    return this.evaluationService.create(createEvaluationDto);
  }

  @Get()
  async findAll(): Promise<Evaluation[]> {
    return this.evaluationService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number): Promise<Evaluation> {
    return this.evaluationService.findOne(id);
  }

  @Get('rated/:userId')
  async findByUserRated(@Param('userId', ParseIntPipe) userId: number): Promise<Evaluation[]> {
    return this.evaluationService.findByUserRated(userId);
  }

  @Get('rater/:userId')
  async findByUserRater(@Param('userId', ParseIntPipe) userId: number): Promise<Evaluation[]> {
    return this.evaluationService.findByUserRater(userId);
  }

  @Patch(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateEvaluationDto: UpdateEvaluationDto,
  ): Promise<Evaluation> {
    return this.evaluationService.update(id, updateEvaluationDto);
  }

  @Delete(':id')
  async remove(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return this.evaluationService.remove(id);
  }
}
