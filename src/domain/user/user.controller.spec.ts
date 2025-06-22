import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { DatabaseService } from '../../database/database.service';

describe('UserController (e2e)', () => {
  let app: INestApplication;
  let userService: UserService;
  let databaseService: DatabaseService;

  const mockUser = {
    id: 1,
    name: 'Marcos Silva',
    email: 'marcos@ufrgs.br',
    password: 'hashedPassword',
    uniCard: 'UNI001',
    course: 'Engenharia de Software',
    contact: '11999999999',
    rating: 5.0,
    createdAt: new Date(),
    booksOwned: [],
    ratingsGiven: [],
    ratingsReceived: [],
    matchesAsUser1: [],
    matchesAsUser2: []
  };

  const mockUsers = [mockUser];

  const mockUserService = {
    findAll: jest.fn().mockResolvedValue(mockUsers),
    findOne: jest.fn().mockResolvedValue(mockUser),
    create: jest.fn().mockResolvedValue(mockUser),
    update: jest.fn().mockResolvedValue(mockUser),
    remove: jest.fn().mockResolvedValue(undefined),
    findFirst5: jest.fn().mockResolvedValue(mockUsers.slice(0, 5)),
    findByEmail: jest.fn().mockResolvedValue(mockUser),
    findByUniCard: jest.fn().mockResolvedValue(mockUser),
    getUserExchanges: jest.fn().mockResolvedValue([]),
    getUserAsRequesterExchanges: jest.fn().mockResolvedValue([]),
    getUserAsProviderExchanges: jest.fn().mockResolvedValue([])
  };

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      controllers: [UserController],
      providers: [
        {
          provide: UserService,
          useValue: mockUserService
        },
        {
          provide: DatabaseService,
          useValue: {}
        }
      ],
    }).compile();

    app = moduleFixture.createNestApplication();
    userService = moduleFixture.get<UserService>(UserService);
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('GET /users', () => {
    it('should return all users', async () => {
      const response = await request(app.getHttpServer())
        .get('/users')
        .expect(200);

      expect(response.body).toEqual(mockUsers);
      expect(userService.findAll).toHaveBeenCalled();
    });
  });

  describe('GET /users/:id', () => {
    it('should return a user by id', async () => {
      const response = await request(app.getHttpServer())
        .get('/users/1')
        .expect(200);

      expect(response.body).toEqual(mockUser);
      expect(userService.findOne).toHaveBeenCalledWith(1);
    });

    it('should return 400 for invalid id', async () => {
      await request(app.getHttpServer())
        .get('/users/invalid')
        .expect(400);
    });
  });

  describe('POST /users', () => {
    it('should create a new user', async () => {
      const createUserDto = {
        name: 'João Silva',
        email: 'joao@test.com',
        password: 'password123',
        uniCard: 'UNI001',
        course: 'Engenharia de Software',
        contact: '11999999999'
      };

      const response = await request(app.getHttpServer())
        .post('/users')
        .send(createUserDto)
        .expect(201);

      expect(response.body).toEqual(mockUser);
      expect(userService.create).toHaveBeenCalledWith(createUserDto);
    });

    it('should return 400 for invalid data', async () => {
      const invalidUserDto = {
        name: '',
        email: 'invalid-email'
      };

      await request(app.getHttpServer())
        .post('/users')
        .send(invalidUserDto)
        .expect(400);
    });
  });

  describe('PATCH /users/:id', () => {
    it('should update a user', async () => {
      const updateUserDto = {
        name: 'João Silva Updated',
        course: 'Ciência da Computação'
      };

      const response = await request(app.getHttpServer())
        .patch('/users/1')
        .send(updateUserDto)
        .expect(200);

      expect(response.body).toEqual(mockUser);
      expect(userService.update).toHaveBeenCalledWith(1, updateUserDto);
    });
  });

  describe('DELETE /users/:id', () => {
    it('should delete a user', async () => {
      await request(app.getHttpServer())
        .delete('/users/1')
        .expect(200);

      expect(userService.remove).toHaveBeenCalledWith(1);
    });
  });

  describe('GET /users/first5', () => {
    it('should return first 5 users', async () => {
      const response = await request(app.getHttpServer())
        .get('/users/first5')
        .expect(200);

      expect(response.body).toEqual(mockUsers);
      expect(userService.findFirst5).toHaveBeenCalled();
    });
  });

  describe('GET /users/email/:email', () => {
    it('should return a user by email', async () => {
      const response = await request(app.getHttpServer())
        .get('/users/email/joao@test.com')
        .expect(200);

      expect(response.body).toEqual(mockUser);
      expect(userService.findByEmail).toHaveBeenCalledWith('joao@test.com');
    });
  });

  describe('GET /users/unicard/:uniCard', () => {
    it('should return a user by uniCard', async () => {
      const response = await request(app.getHttpServer())
        .get('/users/unicard/UNI001')
        .expect(200);

      expect(response.body).toEqual(mockUser);
      expect(userService.findByUniCard).toHaveBeenCalledWith('UNI001');
    });
  });

  describe('GET /users/:id/exchanges', () => {
    it('should return user exchanges', async () => {
      const response = await request(app.getHttpServer())
        .get('/users/1/exchanges')
        .expect(200);

      expect(response.body).toEqual([]);
      expect(userService.getUserExchanges).toHaveBeenCalledWith(1);
    });
  });

  describe('GET /users/:id/exchanges/as-requester', () => {
    it('should return user exchanges as requester', async () => {
      const response = await request(app.getHttpServer())
        .get('/users/1/exchanges/as-requester')
        .expect(200);

      expect(response.body).toEqual([]);
      expect(userService.getUserAsRequesterExchanges).toHaveBeenCalledWith(1);
    });
  });

  describe('GET /users/:id/exchanges/as-provider', () => {
    it('should return user exchanges as provider', async () => {
      const response = await request(app.getHttpServer())
        .get('/users/1/exchanges/as-provider')
        .expect(200);

      expect(response.body).toEqual([]);
      expect(userService.getUserAsProviderExchanges).toHaveBeenCalledWith(1);
    });
  });
});
