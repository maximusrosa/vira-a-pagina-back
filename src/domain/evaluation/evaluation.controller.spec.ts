import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../../app.module';

describe('ExchangeController (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  it('/exchanges (POST)', async () => {
    const response = await request(app.getHttpServer())
      .post('/exchanges')
      .send({
        matchId: 1,
        requesterBooksIds: [1],
        providerBooksIds: [2],
      });
    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty('id');
  });

  it('/exchanges (GET)', async () => {
    const response = await request(app.getHttpServer()).get('/exchanges');
    expect(response.status).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);
  });

  // Adicione outros testes para os demais endpoints...

  afterAll(async () => {
    await app.close();
  });
});