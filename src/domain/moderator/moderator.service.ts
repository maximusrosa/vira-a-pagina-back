import { Injectable, NotFoundException } from '@nestjs/common';
import { DatabaseService } from '../../database/database.service';
import { Prisma, BookStatus } from '@prisma/client';

@Injectable()
export class ModeratorService {
  constructor(private readonly databaseService: DatabaseService) {}

  async create(createModeratorDto: Prisma.ModeratorCreateInput) {
    return this.databaseService.moderator.create({ 
      data: createModeratorDto 
    });
  }

  async findAll() {
    return this.databaseService.moderator.findMany({});
  }

  async findOne(id: number) {
    return this.databaseService.moderator.findUnique({
      where: { id },
    });
  }

  async findByEmail(email: string) {
    return this.databaseService.moderator.findUnique({
      where: { email },
    });
  }

  async update(id: number, updateModeratorDto: Prisma.ModeratorUpdateInput) {
    return this.databaseService.moderator.update({
      where: { id },
      data: updateModeratorDto,
    });
  }

  async remove(id: number) {
    return this.databaseService.moderator.delete({
      where: { id },
    });
  }

  async updateBookStatus(bookId: number, status: BookStatus) {
    // Verify book exists
    const book = await this.databaseService.book.findUnique({
      where: { id: bookId },
    });

    if (!book) {
      throw new NotFoundException(`Livro com id ${bookId} não encontrado.`);
    }

    // If status is REJECTED, delete the book instead of updating its status
    if (status === BookStatus.REJECTED) {
      return this.databaseService.book.delete({
        where: { id: bookId },
        include: {
          owner: true,
          requesterExchanges: true,
          providerExchanges: true,
        },
      });
    }

    // Update book status
    return this.databaseService.book.update({
      where: { id: bookId },
      data: { status },
      include: {
        owner: true,
        requesterExchanges: true,
        providerExchanges: true,
      },
    });
  }
}
