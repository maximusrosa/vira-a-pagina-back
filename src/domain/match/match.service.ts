import { Injectable, NotFoundException } from '@nestjs/common';
import { DatabaseService } from '../../database/database.service';
import { CreateMatchDto } from './dtos/create-match.dto';
import { UpdateMatchDto } from './dtos/update-match.dto';

@Injectable()
export class MatchService {
  constructor(private readonly databaseService: DatabaseService) {}

  async create(createMatchDto: CreateMatchDto) {
    return this.databaseService.match.create({
      data: {
        user1: { connect: { id: createMatchDto.user1Id } },
        user2: { connect: { id: createMatchDto.user2Id } },
        booksUser1: { connect: createMatchDto.booksUser1Ids.map(id => ({ id })) },
        booksUser2: { connect: createMatchDto.booksUser2Ids.map(id => ({ id })) },
      },
      include: {
        user1: true,
        user2: true,
        booksUser1: true,
        booksUser2: true,
        exchanges: true,
      },
    });
  }

  async findAll() {
    return this.databaseService.match.findMany({
      include: {
        user1: true,
        user2: true,
        booksUser1: true,
        booksUser2: true,
        exchanges: true,
      },
    });
  }

  async findOne(id: number) {
    const match = await this.databaseService.match.findUnique({
      where: { id },
      include: {
        user1: true,
        user2: true,
        booksUser1: true,
        booksUser2: true,
        exchanges: true,
      },
    });
    if (!match) throw new NotFoundException(`Match com id ${id} não encontrado.`);
    return match;
  }

  async update(id: number, updateMatchDto: UpdateMatchDto) {
    const exists = await this.databaseService.match.findUnique({ where: { id } });
    if (!exists) throw new NotFoundException(`Match com id ${id} não encontrado.`);
    return this.databaseService.match.update({
      where: { id },
      data: updateMatchDto,
      include: {
        user1: true,
        user2: true,
        booksUser1: true,
        booksUser2: true,
        exchanges: true,
      },
    });
  }

  async remove(id: number) {
    const exists = await this.databaseService.match.findUnique({ where: { id } });
    if (!exists) throw new NotFoundException(`Match com id ${id} não encontrado.`);
    await this.databaseService.match.delete({ where: { id } });
    return { message: `Match com id ${id} removido.` };
  }
}
