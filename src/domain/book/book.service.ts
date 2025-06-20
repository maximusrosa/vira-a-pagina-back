import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { DatabaseService } from '../../database/database.service';
import { CreateBookDto } from './dtos/create-book.dto';
import { UpdateBookDto } from './dtos/update-book.dto';
import { Book, BookCondition, BookStatus } from '@prisma/client';

export interface PaginatedBooks {
  items: Book[];
  meta: {
    totalItems: number;
    itemCount: number; // número de itens retornados nesta página
    itemsPerPage: number; // same as "limit"
    totalPages: number;
    currentPage: number;
  };
}

@Injectable()
export class BookService {
  constructor(private readonly databaseService: DatabaseService) {}

  /**
   * Cria um novo Book. O Prisma já gera createdAt automaticamente.
   */
  async create(createDto: CreateBookDto): Promise<Book> {
    return this.databaseService.book.create({
      data: {
        title: createDto.title,
        author: createDto.author,
        year: createDto.year,
        discipline: createDto.discipline,
        condition: createDto.condition,
        description: createDto.description,
        status: createDto.status || BookStatus.WAITING_APPROVAL,
        owner: { connect: { id: createDto.ownerId } },
      },
      include: {
        owner: true,
        requesterExchanges: true,
        providerExchanges: true,
      },
    });
  }

  async findOne(id: number): Promise<Book> {
    const book = await this.databaseService.book.findUnique({
      where: { id },
      include: {
        owner: true,
        requesterExchanges: true,
        providerExchanges: true,
      },
    });

    if (!book) {
      throw new NotFoundException(`Livro com id ${id} não encontrado.`);
    }
    
    return book;
  }
  
  /**
   * Retorna todos os livros. Podemos incluir relações (owner, authorizer, exchanges).
   */
    async findAllWithPagination(
        page: number,
        limit: number,
    ): Promise<PaginatedBooks> {
        // Garantir valores mínimos
        if (page < 1) {
            throw new BadRequestException('O parâmetro "page" deve ser >= 1.');
        }
        if (limit < 1) {
            throw new BadRequestException('O parâmetro "limit" deve ser >= 1.');
        }
        // (Opcional) limitar o máximo de "limit" para, por ex., 100 registros por vez
        const MAX_LIMIT = 100;
        if (limit > MAX_LIMIT) {
            limit = MAX_LIMIT;
        }

        // 1) Contar o total de livros no banco (sem filtros)
        const totalItems = await this.databaseService.book.count();

        // 2) Calcular quantos itens pular
        const skip = (page - 1) * limit;

        // 3) Buscar somente os registros “slice” da página
        const items: Book[] = await this.databaseService.book.findMany({
            skip,
            take: limit,
            orderBy: { createdAt: 'desc' },
            include: {
                owner: true,
                requesterExchanges: true,
                providerExchanges: true,
            },
        });

        // 4) Calcular total de páginas (arredondando para cima)
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

  /**
   * Atualiza os campos fornecidos em updateDto. Se o registro não existir, lança erro.
   */
  async update(id: number, updateDto: UpdateBookDto): Promise<Book> {
    // Verifica existência antes de atualizar, para poder lançar NotFoundException
    const exists = await this.databaseService.book.findUnique({
      where: { id },
    });
    if (!exists) {
      throw new NotFoundException(`Livro com id ${id} não encontrado.`);
    }

    // Monta o objeto data de forma dinâmica
    const data: {
      title?: string;
      author?: string;
      year?: number;
      discipline?: string;
      condition?: BookCondition;
      description?: string | null;
      status?: BookStatus;
      owner?: { connect: { id: number } };
    } = {};

    if (updateDto.title !== undefined) {
      data.title = updateDto.title;
    }
    if (updateDto.author !== undefined) {
      data.author = updateDto.author;
    }
    if (updateDto.year !== undefined) {
      data.year = updateDto.year;
    }
    if (updateDto.discipline !== undefined) {
      data.discipline = updateDto.discipline;
    }
    if (updateDto.condition !== undefined) {
      data.condition = updateDto.condition;
    }
    if (updateDto.description !== undefined) {
      // Se o cliente enviar description = null, ele vai apagar a descrição
      data.description = updateDto.description;
    }
    if (updateDto.status !== undefined) {
      data.status = updateDto.status;
    }
    if (updateDto.ownerId !== undefined) {
      data.owner = { connect: { id: updateDto.ownerId } };
    }

    return this.databaseService.book.update({
      where: { id },
      data,
      include: {
        owner: true,
        requesterExchanges: true,
        providerExchanges: true,
      },
    });
  }

  /**
   * Remove um livro pelo id. Se não existir, lança NotFoundException.
   */
  async remove(id: number): Promise<void> {
    try {
      await this.databaseService.book.delete({ where: { id } });
    } catch (err) {
      // Se o Prisma lançar erro “Record to delete does not exist”, capturamos e transformamos em NotFoundException
      throw new NotFoundException(`Livro com id ${id} não encontrado.`);
    }
  }
}
