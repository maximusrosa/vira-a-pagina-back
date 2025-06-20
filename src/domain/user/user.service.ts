import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../../database/database.service';
import { Prisma } from '@prisma/client';

@Injectable()
export class UserService {
  constructor(private readonly databaseService: DatabaseService) {}

  async create(createUserDto: Prisma.UserCreateInput) {
    return this.databaseService.user.create({ 
      data: createUserDto,
      include: {
        booksOwned: true,
        providedExchanges: true,
        requestedExchanges: true,
        ratingsGiven: true,
        ratingsReceived: true,
      }
    });
  }

  async findAll() {
    return this.databaseService.user.findMany({
      include: {
        booksOwned: true,
        providedExchanges: true,
        requestedExchanges: true,
        ratingsReceived: true,
      }
    });
  }

  async findOne(id: number) {
    return this.databaseService.user.findUnique({
      where: { id },
      include: {
        booksOwned: true,
        providedExchanges: true,
        requestedExchanges: true,
        ratingsGiven: true,
        ratingsReceived: true,
      }
    });
  }

  async findFirst5() {
    return this.databaseService.user.findMany({
      take: 5,
      orderBy: { id: 'asc' },
      select: {
        id: true,
        name: true,
        email: true,
        uniCard: true,
        course: true,
        rating: true,
      },
    });
  }

  async findByEmail(email: string): Promise<any | undefined> {
    return await this.databaseService.user.findUnique({
      where: { email },
      select: {
        id: true,
        name: true,
        email: true,
        password: true,
        uniCard: true,
        course: true,
        contact: true,
        rating: true,
      },
    });
  }

  async findByUniCard(uniCard: string): Promise<any | undefined> {
    return await this.databaseService.user.findUnique({
      where: { uniCard },
    });
  }

  async update(id: number, updateUserDto: Prisma.UserUpdateInput) {
    return this.databaseService.user.update({
      where: { id },
      data: updateUserDto,
      include: {
        booksOwned: true,
        providedExchanges: true,
        requestedExchanges: true,
        ratingsGiven: true,
        ratingsReceived: true,
      }
    });
  }

  async remove(id: number) {
    return this.databaseService.user.delete({
      where: { id },
    });
  }
}
