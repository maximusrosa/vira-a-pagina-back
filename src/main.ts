import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Enable CORS with strict settings for localhost
  app.enableCors({
    origin: 'http://localhost:3000', // Your frontend URL
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'], // Allowed methods
    allowedHeaders: ['Content-Type', 'Authorization'], // Allowed headers
    credentials: true, // Enable cookies/auth headers
    preflightContinue: false, // Disable preflight caching
    optionsSuccessStatus: 204, // Return 204 for OPTIONS requests
  });

  await app.listen(process.env.SERVER_PORT || 3000); // Backend on a different port (e.g., 3001)
}
bootstrap();