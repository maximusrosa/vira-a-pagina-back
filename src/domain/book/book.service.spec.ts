import { Test, TestingModule } from '@nestjs/testing';
import { BookService, PaginatedBooks } from './book.service';
import { DatabaseService } from '../../database/database.service';
import { BadRequestException } from '@nestjs/common';
import { BookCondition, BookStatus } from '@prisma/client';

type MockPrismaBook = {
  count: jest.Mock;
  findMany: jest.Mock;
  findUnique: jest.Mock;
  create: jest.Mock;
  update: jest.Mock;
  delete: jest.Mock;
};

const mockPrisma = {
  book: {
    count: jest.fn(),
    findMany: jest.fn(),
    findUnique: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
};

describe('BookService (pagination)', () => {
  let service: BookService;
  let prisma: typeof mockPrisma;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BookService,
        {
          provide: DatabaseService,
          useValue: mockPrisma,
        },
      ],
    }).compile();

    service = module.get<BookService>(BookService);
    prisma = module.get<DatabaseService>(DatabaseService) as any;

    // Clear mocks before each test
    prisma.book.count.mockClear();
    prisma.book.findMany.mockClear();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findAllWithPagination', () => {
    it('throws BadRequestException if page < 1', async () => {
      await expect(service.findAllWithPagination(0, 10)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('throws BadRequestException if limit < 1', async () => {
      await expect(service.findAllWithPagination(1, 0)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('caps limit to MAX_LIMIT (100) if client asks for > 100', async () => {
      // Arrange: pretend there are 250 books total
      prisma.book.count.mockResolvedValue(250);
      // If limit > 100, service will set limit = 100 internally
      // skip = (page - 1) * limit = (1 - 1) * 100 = 0
      const fakeBooks: any[] = Array.from({ length: 100 }, (_, i) => ({
        id: i + 1,
        title: `Book ${i + 1}`,
        author: 'Author',
        year: 2020,
        discipline: 'Test',
        condition: BookCondition.ACCEPTABLE,
        description: `Desc ${i + 1}`,
        status: BookStatus.AVAILABLE,
        ownerId: 1,
        authorizerId: 2,
        createdAt: new Date(),
        owner: { id: 1, name: 'Owner' },
        authorizer: { id: 2, name: 'Auth' },
        exchanges: [],
      }));
      prisma.book.findMany.mockResolvedValue(fakeBooks);

      // Act
      const result: PaginatedBooks = await service.findAllWithPagination(
        1,
        500,
      );

      // Assert
      expect(prisma.book.count).toHaveBeenCalledTimes(1);
      // Internally the service should have used limit = 100
      expect(prisma.book.findMany).toHaveBeenCalledWith({
        skip: 0,
        take: 100,
        orderBy: { createdAt: 'desc' },
        include: { owner: true, authorizer: true, exchanges: true },
      });

      expect(result.meta.totalItems).toBe(250);
      expect(result.meta.itemsPerPage).toBe(100);
      expect(result.meta.currentPage).toBe(1);
      expect(result.meta.totalPages).toBe(Math.ceil(250 / 100));
      expect(result.items.length).toBe(100);
    });

    it('returns correct items & meta for a middle page', async () => {
      // Arrange: totalItems = 25, page = 2, limit = 10 → skip = 10
      prisma.book.count.mockResolvedValue(25);

      const fakeBooksPage2: any[] = Array.from({ length: 10 }, (_, i) => ({
        id: 10 + i + 1, // IDs 11–20
        title: `Book ${10 + i + 1}`,
        author: 'Author',
        year: 2021,
        discipline: 'CS',
        condition: BookCondition.GOOD,
        description: null,
        status: BookStatus.AVAILABLE,
        ownerId: 3,
        authorizerId: 4,
        createdAt: new Date(),
        owner: { id: 3, name: 'Student' },
        authorizer: { id: 4, name: 'Mod' },
        exchanges: [],
      }));
      prisma.book.findMany.mockResolvedValue(fakeBooksPage2);

      // Act
      const result: PaginatedBooks = await service.findAllWithPagination(2, 10);

      // Assert
      expect(prisma.book.count).toHaveBeenCalledTimes(1);
      expect(prisma.book.findMany).toHaveBeenCalledWith({
        skip: 10, // (2 − 1) * 10
        take: 10,
        orderBy: { createdAt: 'desc' },
        include: { owner: true, authorizer: true, exchanges: true },
      });

      expect(result.meta.totalItems).toBe(25);
      expect(result.meta.currentPage).toBe(2);
      expect(result.meta.itemsPerPage).toBe(10);
      expect(result.meta.totalPages).toBe(Math.ceil(25 / 10));
      expect(result.items).toEqual(fakeBooksPage2);
    });

    it('returns empty items if page > totalPages', async () => {
      // Arrange: totalItems = 15, page = 3, limit = 10 → totalPages = 2
      prisma.book.count.mockResolvedValue(15);
      prisma.book.findMany.mockResolvedValue([]); // Excess page yields empty array

      // Act
      const result: PaginatedBooks = await service.findAllWithPagination(3, 10);

      // Assert
      expect(prisma.book.count).toHaveBeenCalledTimes(1);
      expect(prisma.book.findMany).toHaveBeenCalledWith({
        skip: 20, // (3 − 1) * 10 = 20
        take: 10,
        orderBy: { createdAt: 'desc' },
        include: { owner: true, authorizer: true, exchanges: true },
      });

      expect(result.meta.totalItems).toBe(15);
      expect(result.meta.currentPage).toBe(3);
      expect(result.meta.totalPages).toBe(2);
      expect(result.items.length).toBe(0);
    });
  });
});
