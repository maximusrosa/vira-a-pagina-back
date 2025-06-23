import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { DatabaseService } from '../../database/database.service';
import { CreateEvaluationDto } from './dtos/create-evaluation.dto';
import { UpdateEvaluationDto } from './dtos/update-evaluation.dto';
import { Evaluation } from '@prisma/client';

@Injectable()
export class EvaluationService {
  constructor(private readonly databaseService: DatabaseService) {}

  async create(createDto: CreateEvaluationDto): Promise<Evaluation> {
    // Check if evaluation already exists
    const existingEvaluation = await this.databaseService.evaluation.findUnique({
      where: {
        raterId_ratedId: {
          raterId: createDto.raterId,
          ratedId: createDto.ratedId,
        },
      },
    });

    if (existingEvaluation) {
      throw new ConflictException('Avaliação já existe entre estes usuários.');
    }

    const evaluation = await this.databaseService.evaluation.create({
      data: {
        rater: { connect: { id: createDto.raterId } },
        rated: { connect: { id: createDto.ratedId } },
        rating: createDto.rating,
      },
      include: {
        rater: true,
        rated: true,
      },
    });

    // Update the rated user's average rating
    await this.updateUserRating(createDto.ratedId);

    return evaluation;
  }

  async findAll() {
    return this.databaseService.evaluation.findMany({
      include: {
        rater: true,
        rated: true,
      },
    });
  }

  async findOne(id: number): Promise<Evaluation> {
    const evaluation = await this.databaseService.evaluation.findUnique({
      where: { id },
      include: {
        rater: true,
        rated: true,
      },
    });
    if (!evaluation) {
      throw new NotFoundException(`Avaliação com id ${id} não encontrada.`);
    }
    return evaluation;
  }

  async findByUserRated(userId: number) {
    return this.databaseService.evaluation.findMany({
      where: { ratedId: userId },
      include: {
        rater: true,
      },
    });
  }

  async findByUserRater(userId: number) {
    return this.databaseService.evaluation.findMany({
      where: { raterId: userId },
      include: {
        rated: true
      },
    });
  }

  async update(id: number, updateDto: UpdateEvaluationDto): Promise<Evaluation> {
    const evaluation = await this.databaseService.evaluation.findUnique({ where: { id } });
    if (!evaluation) {
      throw new NotFoundException(`Avaliação com id ${id} não encontrada.`);
    }

    const updatedEvaluation = await this.databaseService.evaluation.update({
      where: { id },
      data: updateDto,
      include: {
        rater: true,
        rated: true,
      },
    });

    // Update the rated user's average rating if rating changed
    if (updateDto.rating !== undefined) {
      await this.updateUserRating(evaluation.ratedId);
    }

    return updatedEvaluation;
  }

  async remove(id: number): Promise<void> {
    const evaluation = await this.databaseService.evaluation.findUnique({ where: { id } });
    if (!evaluation) {
      throw new NotFoundException(`Avaliação com id ${id} não encontrada.`);
    }

    await this.databaseService.evaluation.delete({ where: { id } });
    
    // Update the rated user's average rating
    await this.updateUserRating(evaluation.ratedId);
  }

  private async updateUserRating(userId: number): Promise<void> {
    const evaluations = await this.databaseService.evaluation.findMany({
      where: { ratedId: userId },
    });

    const averageRating = evaluations.length > 0
      ? evaluations.reduce((sum, evaluation) => sum + evaluation.rating, 0) / evaluations.length
      : 5.0; // Default rating

    await this.databaseService.user.update({
      where: { id: userId },
      data: { rating: averageRating },
    });
  }
}
