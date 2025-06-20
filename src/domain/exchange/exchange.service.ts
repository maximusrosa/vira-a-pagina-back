import { Injectable, NotFoundException } from '@nestjs/common';
import { DatabaseService } from '../../database/database.service';
import { CreateExchangeDto } from './dtos/create-exchange.dto';
import { UpdateExchangeDto } from './dtos/update-exchange.dto';
import { Exchange, ExchangeStatus } from '@prisma/client';

@Injectable()
export class ExchangeService {
  constructor(private readonly databaseService: DatabaseService) {}

  async create(createDto: CreateExchangeDto): Promise<Exchange> {
    return this.databaseService.exchange.create({
      data: {
        requesterBook: { connect: { id: createDto.requesterBookId } },
        requester: { connect: { id: createDto.requesterId } },
        providerBook: { connect: { id: createDto.providerBookId } },
        provider: { connect: { id: createDto.providerId } },
        status: ExchangeStatus.REQUESTED,
        completionDate: createDto.completionDate,
      },
      include: {
        requesterBook: true,
        requester: true,
        providerBook: true,
        provider: true,
      },
    });
  }

  async findAll() {
    return this.databaseService.exchange.findMany({
      include: {
        requesterBook: true,
        requester: true,
        providerBook: true,
        provider: true,
      },
    });
  }

  async findOne(id: number): Promise<Exchange> {
    const exchange = await this.databaseService.exchange.findUnique({
      where: { id },
      include: {
        requesterBook: true,
        requester: true,
        providerBook: true,
        provider: true,
      },
    });
    if (!exchange) {
      throw new NotFoundException(`Troca com id ${id} não encontrada.`);
    }
    return exchange;
  }

  async update(id: number, updateDto: UpdateExchangeDto): Promise<Exchange> {
    const exists = await this.databaseService.exchange.findUnique({ where: { id } });
    if (!exists) {
      throw new NotFoundException(`Troca com id ${id} não encontrada.`);
    }

    return this.databaseService.exchange.update({
      where: { id },
      data: updateDto,
      include: {
        requesterBook: true,
        requester: true,
        providerBook: true,
        provider: true,
      },
    });
  }

  async remove(id: number): Promise<void> {
    try {
      await this.databaseService.exchange.delete({ where: { id } });
    } catch (err) {
      throw new NotFoundException(`Troca com id ${id} não encontrada.`);
    }
  }
}
