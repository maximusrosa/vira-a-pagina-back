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
        ratingsGiven: true,
        ratingsReceived: true,
        matchesAsUser1: true,
        matchesAsUser2: true,
      }
    });
  }

  async findAll(activeOnly: boolean) {
    if (activeOnly) {
      return this.databaseService.user.findMany({
        where: { status: 'ACTIVE' },
        include: {
          booksOwned: true,
          ratingsReceived: true,
          matchesAsUser1: true,
          matchesAsUser2: true,
        }
      });
    }
    return this.databaseService.user.findMany({
      include: {
        booksOwned: true,
        ratingsReceived: true,
        matchesAsUser1: true,
        matchesAsUser2: true,
      }
    });
  }

  async findOne(id: number, activeOnly: boolean) {
    if (activeOnly) {
      return this.databaseService.user.findFirst({
        where: { id, status: 'ACTIVE' },
        include: {
          booksOwned: true,
          ratingsGiven: true,
          ratingsReceived: true,
          matchesAsUser1: true,
          matchesAsUser2: true
        }
      });
    }
    return this.databaseService.user.findUnique({
      where: { id },
      include: {
        booksOwned: true,
        ratingsGiven: true,
        ratingsReceived: true,
        matchesAsUser1: true,
        matchesAsUser2: true
      }
    });
  }

  async findFirst5(activeOnly: boolean) {
    if (activeOnly) {
      return this.databaseService.user.findMany({
        where: { status: 'ACTIVE' },
        take: 5,
        orderBy: { id: 'asc' },
        select: {
          id: true,
          name: true,
          email: true,
          uniCard: true,
          course: true,
          rating: true,
          status: true
        },
      });
    }
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
        status: true
      },
    });
  }

  async findByEmail(email: string, activeOnly: boolean): Promise<any | undefined> {
    if (activeOnly) {
      return await this.databaseService.user.findFirst({
        where: { email, status: 'ACTIVE' },
        select: {
          id: true,
          name: true,
          email: true,
          password: true,
          uniCard: true,
          course: true,
          contact: true,
          rating: true,
          status: true
        },
      });
    }
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
        status: true
      },
    });
  }
  async findByUniCard(uniCard: string, activeOnly: boolean): Promise<any | undefined> {
    if (activeOnly) {
      return await this.databaseService.user.findFirst({
        where: { uniCard, status: 'ACTIVE' }
      });
    }
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
        ratingsGiven: true,
        ratingsReceived: true,
        matchesAsUser1: true,
        matchesAsUser2: true,
      }
    });
  }

  async remove(id: number) {
    return this.databaseService.user.delete({
      where: { id },
    });
  }

  // Get all exchanges where user's books are involved
  async getUserExchanges(userId: number) {
    return this.databaseService.exchange.findMany({
      where: {
        OR: [
          { requesterBooks: { some: { ownerId: userId } } },
          { providerBooks: { some: { ownerId: userId } } }
        ]
      },
      include: {
        match: {
          include: {
            user1: true,
            user2: true
          }
        },
        requesterBooks: {
          include: { owner: true }
        },
        providerBooks: {
          include: { owner: true }
        }
      }
    });
  }

  // Get exchanges where user is the requester (owns books in requesterBooks)
  async getUserAsRequesterExchanges(userId: number) {
    return this.databaseService.exchange.findMany({
      where: {
        requesterBooks: { some: { ownerId: userId } }
      },
      include: {
        match: true,
        requesterBooks: true,
        providerBooks: { include: { owner: true } }
      }
    });
  }

  // Get exchanges where user is the provider (owns books in providerBooks)
  async getUserAsProviderExchanges(userId: number) {
    return this.databaseService.exchange.findMany({
      where: {
        providerBooks: { some: { ownerId: userId } }
      },
      include: {
        match: true,
        providerBooks: true,
        requesterBooks: { include: { owner: true } }
      }
    });
  }
}
