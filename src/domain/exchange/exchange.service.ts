import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { DatabaseService } from '../../database/database.service';
import { CreateExchangeDto } from './dtos/create-exchange.dto';
import { UpdateExchangeDto } from './dtos/update-exchange.dto';
import { Exchange, ExchangeStatus, BookStatus } from '@prisma/client';

@Injectable()
export class ExchangeService {
  constructor(private readonly databaseService: DatabaseService) {}

  async create(createDto: CreateExchangeDto): Promise<Exchange> {
    // Validate that both books exist and are available
    const requesterBook = await this.databaseService.book.findUnique({
      where: { id: createDto.requesterBookId },
    });

    if (!requesterBook) {
      throw new NotFoundException(
        `Livro do solicitante com id ${createDto.requesterBookId} não encontrado.`,
      );
    }

    if (requesterBook.status !== BookStatus.AVAILABLE) {
      throw new BadRequestException(
        `Livro do solicitante não está disponível para troca. Status atual: ${requesterBook.status}`,
      );
    }

    const providerBook = await this.databaseService.book.findUnique({
      where: { id: createDto.providerBookId },
    });

    if (!providerBook) {
      throw new NotFoundException(
        `Livro do provedor com id ${createDto.providerBookId} não encontrado.`,
      );
    }

    if (providerBook.status !== BookStatus.AVAILABLE) {
      throw new BadRequestException(
        `Livro do provedor não está disponível para troca. Status atual: ${providerBook.status}`,
      );
    }

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

  async findByRequester(requesterId: number): Promise<Exchange[]> {
    return this.databaseService.exchange.findMany({
      where: { requesterId },
      include: {
        requesterBook: true,
        requester: true,
        providerBook: true,
        provider: true,
      },
    });
  }

  async findByProvider(providerId: number): Promise<Exchange[]> {
    return this.databaseService.exchange.findMany({
      where: { providerId },
      include: {
        requesterBook: true,
        requester: true,
        providerBook: true,
        provider: true,
      },
    });
  }

  async findByUser(userId: number): Promise<Exchange[]> {
    return this.databaseService.exchange.findMany({
      where: {
        OR: [
          { requesterId: userId },
          { providerId: userId },
        ],
      },
      include: {
        requesterBook: true,
        requester: true,
        providerBook: true,
        provider: true,
      },
    });
  }

  async findByStatus(status: ExchangeStatus): Promise<Exchange[]> {
    return this.databaseService.exchange.findMany({
      where: { status },
      include: {
        requesterBook: true,
        requester: true,
        providerBook: true,
        provider: true,
      },
    });
  }

  async findWaitingForApproval(): Promise<Exchange[]> {
    return this.findByStatus(ExchangeStatus.REQUESTED);
  }
}
