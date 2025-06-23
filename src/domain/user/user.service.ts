import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../../database/database.service';
import { Prisma, Book } from '@prisma/client';

export interface PaginatedUsers {
  data: any[];
  meta: {
    total: number;
    page: number;
    lastPage: number;
  };
}

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

  async likeBook(userId: number, bookId: number) {
    return this.databaseService.user.update({ 
      where: { id: userId },
      data: {
        booksLiked: {
          connect: { id: bookId }
        }
      },
      include: {
        booksOwned: true,
        booksLiked: true,
        ratingsGiven: true,
        ratingsReceived: true,
        matchesAsUser1: true,
        matchesAsUser2: true,
      }
    });
  }

  async likeBookAndTrackMatch(bookId: number, userId: number) {
    // First, like the book
    const user = await this.likeBook(userId, bookId);
    const book = await this.databaseService.book.findUnique({ where: { id: bookId } });
    if (!book) throw new Error('Book not found');
    
    const user1Id = userId;
    const user2Id = book.ownerId;
    
    // Don't create a match if user is liking their own book
    if (user1Id === user2Id) {
      return user;
    }
    
    // Get all books that user1 (current user) has liked from user2 (book owner)
    const user1Likes = await this.databaseService.user.findUnique({
      where: { id: user1Id },
      include: { booksLiked: true }
    });
    const user1LikedBooksFromUser2 = user1Likes?.booksLiked.filter(b => b.ownerId === user2Id) ?? [];

    // Get all books that user2 (book owner) has liked from user1 (current user)
    const user2Likes = await this.databaseService.user.findUnique({
      where: { id: user2Id },
      include: { booksLiked: true }
    });
    const user2LikedBooksFromUser1 = user2Likes?.booksLiked.filter(b => b.ownerId === user1Id) ?? [];

    // Check if there is mutual interest (book owner has liked at least one of user's books)
    const hasMutualInterest = user2LikedBooksFromUser1.length > 0;
    
    if (hasMutualInterest) {
      // Check if a match already exists between these users
      const existingMatch = await this.databaseService.match.findFirst({
        where: {
          OR: [
            { AND: [{ user1Id: user1Id }, { user2Id: user2Id }] },
            { AND: [{ user1Id: user2Id }, { user2Id: user1Id }] }
          ]
        },
        include: {
          booksUser1: true,
          booksUser2: true
        }
      });
      
      if (existingMatch) {
        // Update the existing match
        if (existingMatch.user1Id === user1Id) {
          // Current user is user1 in the match
          return this.databaseService.match.update({
            where: { id: existingMatch.id },
            data: {
              booksUser1: {
                set: user1LikedBooksFromUser2.map(book => ({ id: book.id }))
              }
            },
            include: {
              user1: true,
              user2: true,
              booksUser1: true,
              booksUser2: true
            }
          });
        } else {
          // Current user is user2 in the match
          return this.databaseService.match.update({
            where: { id: existingMatch.id },
            data: {
              booksUser2: {
                set: user1LikedBooksFromUser2.map(book => ({ id: book.id }))
              }
            },
            include: {
              user1: true,
              user2: true,
              booksUser1: true,
              booksUser2: true
            }
          });
        }
      } else {
        // Create a new match with current user as user1 and book owner as user2
        return this.databaseService.match.create({
          data: {
            user1: { connect: { id: user1Id } },
            user2: { connect: { id: user2Id } },
            booksUser1: {
              connect: user1LikedBooksFromUser2.map(book => ({ id: book.id }))
            },
            booksUser2: {
              connect: user2LikedBooksFromUser1.map(book => ({ id: book.id }))
            }
          },
          include: {
            user1: true,
            user2: true,
            booksUser1: true,
            booksUser2: true
          }
        });
      }
    }
    
    // If there's no mutual interest yet, just return the user
    return user;
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

  async findAllWithPagination(
    page: number,
    limit: number,
    activeOnly: boolean,
  ): Promise<PaginatedUsers> {
    const skip = (page - 1) * limit;
    
    let whereClause = {};
    if (activeOnly) {
      whereClause = { status: 'ACTIVE' };
    }

    const [users, total] = await Promise.all([
      this.databaseService.user.findMany({
        where: whereClause,
        skip,
        take: limit,
        include: {
          booksOwned: true,
          ratingsReceived: true,
          matchesAsUser1: true,
          matchesAsUser2: true,
        },
      }),
      this.databaseService.user.count({ where: whereClause })
    ]);

    const lastPage = Math.ceil(total / limit);

    return {
      data: users,
      meta: {
        total,
        page,
        lastPage,
      },
    };
  }
}
