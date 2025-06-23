import { Test, TestingModule } from '@nestjs/testing';
import { UserService } from './user.service';

describe('UserService', () => {
  let service: UserService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [UserService],
    }).compile();

    service = module.get<UserService>(UserService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
describe('likeBookAndTrackMatch', () => {
  let databaseServiceMock;
  let service: UserService;
  
  beforeEach(() => {
    // Create a mock for the DatabaseService
    databaseServiceMock = {
      user: {
        update: jest.fn(),
        findUnique: jest.fn()
      },
      book: {
        findUnique: jest.fn()
      },
      match: {
        findFirst: jest.fn(),
        update: jest.fn(),
        create: jest.fn()
      }
    };
    
    // Reinitialize the service with the mock
    service = new UserService(databaseServiceMock as any);
  });
  
  it('should like the book and return user without match if user likes their own book', async () => {
    // Arrange
    const userId = 1;
    const bookId = 1;
    const user = { id: userId, name: 'Test User' };
    const book = { id: bookId, ownerId: userId, title: 'Test Book' };
    
    databaseServiceMock.user.update.mockResolvedValue(user);
    databaseServiceMock.book.findUnique.mockResolvedValue(book);
    
    // Act
    const result = await service.likeBookAndTrackMatch(bookId, userId);
    
    // Assert
    expect(databaseServiceMock.user.update).toHaveBeenCalledWith({
      where: { id: userId },
      data: { booksLiked: { connect: { id: bookId } } },
      include: expect.any(Object)
    });
    expect(databaseServiceMock.book.findUnique).toHaveBeenCalledWith({ where: { id: bookId } });
    expect(result).toEqual(user);
    expect(databaseServiceMock.match.findFirst).not.toHaveBeenCalled();
  });
  
  it('should return user without match if there is no mutual interest', async () => {
    // Arrange
    const userId = 1;
    const bookOwnerId = 2;
    const bookId = 1;
    const user = { id: userId, name: 'Test User' };
    const book = { id: bookId, ownerId: bookOwnerId, title: 'Test Book' };
    
    databaseServiceMock.user.update.mockResolvedValue(user);
    databaseServiceMock.book.findUnique.mockResolvedValue(book);
    databaseServiceMock.user.findUnique.mockImplementation((params) => {
      if (params.where.id === userId) {
        return Promise.resolve({ id: userId, booksLiked: [book] });
      }
      if (params.where.id === bookOwnerId) {
        return Promise.resolve({ id: bookOwnerId, booksLiked: [] }); // No books liked by owner
      }
      return Promise.resolve(null);
    });
    
    // Act
    const result = await service.likeBookAndTrackMatch(bookId, userId);
    
    // Assert
    expect(result).toEqual(user);
    expect(databaseServiceMock.match.findFirst).not.toHaveBeenCalled();
  });
  
  it('should create a new match when there is mutual interest but no existing match', async () => {
    // Arrange
    const userId = 1;
    const bookOwnerId = 2;
    const bookId = 1;
    const userBook = { id: 2, ownerId: userId, title: 'User Book' };
    const ownerBook = { id: bookId, ownerId: bookOwnerId, title: 'Owner Book' };
    const user = { id: userId, name: 'Test User' };
    const match = { id: 1, user1Id: userId, user2Id: bookOwnerId };
    
    databaseServiceMock.user.update.mockResolvedValue(user);
    databaseServiceMock.book.findUnique.mockResolvedValue(ownerBook);
    databaseServiceMock.user.findUnique.mockImplementation((params) => {
      if (params.where.id === userId) {
        return Promise.resolve({ id: userId, booksLiked: [ownerBook] });
      }
      if (params.where.id === bookOwnerId) {
        return Promise.resolve({ id: bookOwnerId, booksLiked: [userBook] });
      }
      return Promise.resolve(null);
    });
    databaseServiceMock.match.findFirst.mockResolvedValue(null);
    databaseServiceMock.match.create.mockResolvedValue(match);
    
    // Act
    const result = await service.likeBookAndTrackMatch(bookId, userId);
    
    // Assert
    expect(databaseServiceMock.match.findFirst).toHaveBeenCalled();
    expect(databaseServiceMock.match.create).toHaveBeenCalledWith({
      data: {
        user1: { connect: { id: userId } },
        user2: { connect: { id: bookOwnerId } },
        booksUser1: { connect: [{ id: ownerBook.id }] },
        booksUser2: { connect: [{ id: userBook.id }] }
      },
      include: expect.any(Object)
    });
    expect(result).toEqual(match);
  });
  
  it('should update existing match when user is user1 in the match', async () => {
    // Arrange
    const userId = 1;
    const bookOwnerId = 2;
    const bookId = 1;
    const userBook = { id: 2, ownerId: userId, title: 'User Book' };
    const ownerBook = { id: bookId, ownerId: bookOwnerId, title: 'Owner Book' };
    const user = { id: userId, name: 'Test User' };
    const existingMatch = { 
      id: 1, 
      user1Id: userId, 
      user2Id: bookOwnerId,
      booksUser1: [],
      booksUser2: []
    };
    const updatedMatch = { ...existingMatch, booksUser1: [ownerBook] };
    
    databaseServiceMock.user.update.mockResolvedValue(user);
    databaseServiceMock.book.findUnique.mockResolvedValue(ownerBook);
    databaseServiceMock.user.findUnique.mockImplementation((params) => {
      if (params.where.id === userId) {
        return Promise.resolve({ id: userId, booksLiked: [ownerBook] });
      }
      if (params.where.id === bookOwnerId) {
        return Promise.resolve({ id: bookOwnerId, booksLiked: [userBook] });
      }
      return Promise.resolve(null);
    });
    databaseServiceMock.match.findFirst.mockResolvedValue(existingMatch);
    databaseServiceMock.match.update.mockResolvedValue(updatedMatch);
    
    // Act
    const result = await service.likeBookAndTrackMatch(bookId, userId);
    
    // Assert
    expect(databaseServiceMock.match.findFirst).toHaveBeenCalled();
    expect(databaseServiceMock.match.update).toHaveBeenCalledWith({
      where: { id: existingMatch.id },
      data: {
        booksUser1: { set: [{ id: ownerBook.id }] }
      },
      include: expect.any(Object)
    });
    expect(result).toEqual(updatedMatch);
  });
  
  it('should update existing match when user is user2 in the match', async () => {
    // Arrange
    const userId = 1;
    const bookOwnerId = 2;
    const bookId = 1;
    const userBook = { id: 2, ownerId: userId, title: 'User Book' };
    const ownerBook = { id: bookId, ownerId: bookOwnerId, title: 'Owner Book' };
    const user = { id: userId, name: 'Test User' };
    const existingMatch = { 
      id: 1, 
      user1Id: bookOwnerId, 
      user2Id: userId,
      booksUser1: [],
      booksUser2: []
    };
    const updatedMatch = { ...existingMatch, booksUser2: [ownerBook] };
    
    databaseServiceMock.user.update.mockResolvedValue(user);
    databaseServiceMock.book.findUnique.mockResolvedValue(ownerBook);
    databaseServiceMock.user.findUnique.mockImplementation((params) => {
      if (params.where.id === userId) {
        return Promise.resolve({ id: userId, booksLiked: [ownerBook] });
      }
      if (params.where.id === bookOwnerId) {
        return Promise.resolve({ id: bookOwnerId, booksLiked: [userBook] });
      }
      return Promise.resolve(null);
    });
    databaseServiceMock.match.findFirst.mockResolvedValue(existingMatch);
    databaseServiceMock.match.update.mockResolvedValue(updatedMatch);
    
    // Act
    const result = await service.likeBookAndTrackMatch(bookId, userId);
    
    // Assert
    expect(databaseServiceMock.match.update).toHaveBeenCalledWith({
      where: { id: existingMatch.id },
      data: {
        booksUser2: { set: [{ id: ownerBook.id }] }
      },
      include: expect.any(Object)
    });
    expect(result).toEqual(updatedMatch);
  });
  
  it('should throw an error if book is not found', async () => {
    // Arrange
    const userId = 1;
    const bookId = 999;
    
    databaseServiceMock.user.update.mockResolvedValue({});
    databaseServiceMock.book.findUnique.mockResolvedValue(null);
    
    // Act & Assert
    await expect(service.likeBookAndTrackMatch(bookId, userId))
      .rejects
      .toThrow('Book not found');
  });
});
