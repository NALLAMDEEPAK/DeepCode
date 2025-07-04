import { NestFactory } from '@nestjs/core';
import { AppModule } from './modules/app.module';
import * as cookieParser from 'cookie-parser';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // Enable cookie parser for JWT cookies
  app.use(cookieParser());
  
  // Configure CORS with specific origins and proper cookie handling
  app.enableCors({
    origin: [
      'http://localhost:3000', // Local development
      'http://localhost:5173', // Vite dev server
      'https://api.deepcode-server.xyz', // Production API
      'https://deepcode-server.xyz', // Production frontend (if different)
    ],
    credentials: true, // Allow cookies to be sent
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Cookie'],
    exposedHeaders: ['Set-Cookie'],
    optionsSuccessStatus: 200, // For legacy browser support
  });
  
  await app.listen(process.env.PORT || 8000);

  console.log(`🚀 Server running on http://localhost:${process.env.PORT || 8000}`);
  console.log(`🌍 CORS enabled for local development and production`);
}
bootstrap();