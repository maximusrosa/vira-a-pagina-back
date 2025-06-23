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
    // Validar todos os livros do solicitante
    const requesterBooks = await this.databaseService.book.findMany({
      where: { id: { in: createDto.requesterBooksIds } },
    });
    if (requesterBooks.length !== createDto.requesterBooksIds.length) {
      throw new NotFoundException('Um ou mais livros do solicitante não foram encontrados.');
    }
    requesterBooks.forEach(book => {
      if (book.status !== BookStatus.AVAILABLE) {
        throw new BadRequestException(
          `Livro do solicitante (id ${book.id}) não está disponível para troca. Status atual: ${book.status}`,
        );
      }
    });

    // Validar todos os livros do provedor
    const providerBooks = await this.databaseService.book.findMany({
      where: { id: { in: createDto.providerBooksIds } },
    });
    if (providerBooks.length !== createDto.providerBooksIds.length) {
      throw new NotFoundException('Um ou mais livros do provedor não foram encontrados.');
    }
    providerBooks.forEach(book => {
      if (book.status !== BookStatus.AVAILABLE) {
        throw new BadRequestException(
          `Livro do provedor (id ${book.id}) não está disponível para troca. Status atual: ${book.status}`,
        );
      }
    });

    return this.databaseService.exchange.create({
      data: {
        match: { connect: { id: createDto.matchId } },
        requesterBooks: { connect: createDto.requesterBooksIds.map(id => ({ id })) },
        providerBooks: { connect: createDto.providerBooksIds.map(id => ({ id })) },
        status: ExchangeStatus.REQUESTED,
        completionDate: createDto.completionDate,
      },
      include: {
        requesterBooks: true,
        providerBooks: true,
      },
    });
  }

  async findAll() {
    return this.databaseService.exchange.findMany({
      include: {
        requesterBooks: true,
        providerBooks: true,
      },
    });
  }

  async findOne(id: number): Promise<Exchange> {
    const exchange = await this.databaseService.exchange.findUnique({
      where: { id },
      include: {
        requesterBooks: true,
        providerBooks: true,
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
        requesterBooks: true,
        providerBooks: true,
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
        requesterBooks: {
          some: {
            ownerId: requesterId,
          },
        },
      },
      include: {
        requesterBooks: true,
        providerBooks: true,
      },
    });
  }

  async findByProvider(providerId: number): Promise<Exchange[]> {
    return this.databaseService.exchange.findMany({
      where: {
        providerBooks: {
          some: {
            ownerId: providerId,
          },
        },
      },
      include: {
        requesterBooks: true,
        providerBooks: true,
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
        { requesterBooks: { some: { ownerId: userId } } },
        { providerBooks: { some: { ownerId: userId } } },
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
        requesterBooks: true,
        providerBooks: true,
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
        requesterBooks: true,
        providerBooks: true,
      },
    });
  }

  async findWaitingForApproval(): Promise<Exchange[]> {
    return this.findByStatus(ExchangeStatus.WAITING_APPROVAL);
  }

  async getProviderId(exchangeId: number): Promise<{ providerId: number }> {
    const exchange = await this.databaseService.exchange.findUnique({
      where: { id: exchangeId },
      include: {
        providerBooks: true,
      },
    });
    if (!exchange) {
      throw new NotFoundException(`Troca com id ${exchangeId} não encontrada.`);
    }
    const providerId = exchange.providerBooks[0].ownerId;

    return { providerId };
}
}
