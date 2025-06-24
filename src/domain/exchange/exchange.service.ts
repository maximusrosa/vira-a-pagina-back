import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { DatabaseService } from '../../database/database.service';
import { CreateExchangeDto } from './dtos/create-exchange.dto';
import { UpdateExchangeDto } from './dtos/update-exchange.dto';
import { Exchange, ExchangeStatus, BookStatus } from '@prisma/client';

export interface PaginatedExchanges {
  items: Exchange[];
  meta: {
    totalItems: number;
    itemCount: number; 
    itemsPerPage: number;
    totalPages: number;
    currentPage: number;
  };
}

@Injectable()
export class ExchangeService {
  constructor(private readonly databaseService: DatabaseService) {}

  async create(createDto: CreateExchangeDto): Promise<Exchange> {
    // Validar livro do solicitante
    const requesterBook = await this.databaseService.book.findUnique({
      where: { id: createDto.requesterBookId },
    });
    if (!requesterBook) {
      throw new NotFoundException('Livro do solicitante não foi encontrado.');
    }
    if (requesterBook.status !== BookStatus.AVAILABLE) {
      throw new BadRequestException(
        `Livro do solicitante (id ${requesterBook.id}) não está disponível para troca. Status atual: ${requesterBook.status}`,
      );
    }

    // Validar livro do provedor
    const providerBook = await this.databaseService.book.findUnique({
      where: { id: createDto.providerBookId },
    });
    if (!providerBook) {
      throw new NotFoundException('Livro do provedor não foi encontrado.');
    }
    if (providerBook.status !== BookStatus.AVAILABLE) {
      throw new BadRequestException(
        `Livro do provedor (id ${providerBook.id}) não está disponível para troca. Status atual: ${providerBook.status}`,
      );
    }

    // Validar usuários
    const requester = await this.databaseService.user.findUnique({ where: { id: createDto.requesterId } });
    if (!requester) throw new NotFoundException('Solicitante não encontrado.');
    const provider = await this.databaseService.user.findUnique({ where: { id: createDto.providerId } });
    if (!provider) throw new NotFoundException('Provedor não encontrado.');

    return this.databaseService.exchange.create({
      data: {
        requesterId: createDto.requesterId,
        providerId: createDto.providerId,
        requesterBookId: createDto.requesterBookId,
        providerBookId: createDto.providerBookId,
        status: ExchangeStatus.REQUESTED,
        completionDate: createDto.completionDate,
      },
      include: {
        requesterBook: true,
        providerBook: true,
      },
    });
  }

  async findAll() {
    return this.databaseService.exchange.findMany({
      include: {
        requesterBook: true,
        providerBook: true,
      },
    });
  }

  async findOne(id: number): Promise<Exchange> {
    const exchange = await this.databaseService.exchange.findUnique({
      where: { id },
      include: {
        requesterBook: true,
        providerBook: true,
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
        providerBook: true,
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
      where: {
        requesterId,
      },
      include: {
        requesterBook: true,
        providerBook: true,
      },
    });
  }

  async findByProvider(providerId: number): Promise<Exchange[]> {
    return this.databaseService.exchange.findMany({
      where: {
        providerId,
      },
      include: {
        requesterBook: true,
        providerBook: true,
      },
    });
  }

  async findByUser(userId: number, page: number = 1, limit: number = 10): Promise<PaginatedExchanges> {
    // Validate pagination parameters
    if (page < 1) {
      throw new BadRequestException('O parâmetro "page" deve ser >= 1.');
    }
    if (limit < 1) {
      throw new BadRequestException('O parâmetro "limit" deve ser >= 1.');
    }
    
    // Optional: limit the maximum number of items per page
    const MAX_LIMIT = 100;
    if (limit > MAX_LIMIT) {
      limit = MAX_LIMIT;
    }

    const where = {
      OR: [
        { requesterId: userId },
        { providerId: userId },
      ],
    };

    // Count total items matching the criteria
    const totalItems = await this.databaseService.exchange.count({
      where,
    });

    // Calculate items to skip
    const skip = (page - 1) * limit;

    // Fetch items for the current page
    const items = await this.databaseService.exchange.findMany({
      where,
      skip,
      take: limit,
      orderBy: { id: 'desc' }, // Order by most recent first (assuming higher IDs are more recent)
      include: {
        requesterBook: true,
        providerBook: true,
      },
    });

    // Calculate total pages
    const totalPages = Math.ceil(totalItems / limit);

    return {
      items,
      meta: {
        totalItems,
        itemCount: items.length,
        itemsPerPage: limit,
        totalPages,
        currentPage: page,
      }
    };
  }

  async findByStatus(status: ExchangeStatus): Promise<Exchange[]> {
    return this.databaseService.exchange.findMany({
      where: { status },
      include: {
        requesterBook: true,
        providerBook: true,
      },
    });
  }

  async findWaitingForApproval(): Promise<Exchange[]> {
    return this.findByStatus(ExchangeStatus.WAITING_APPROVAL);
  }

  async getProviderId(exchangeId: number): Promise<{ providerId: number }> {
    const exchange = await this.databaseService.exchange.findUnique({
      where: { id: exchangeId },
    });
    if (!exchange) {
      throw new NotFoundException(`Troca com id ${exchangeId} não encontrada.`);
    }
    return { providerId: exchange.providerId };
  }
}
