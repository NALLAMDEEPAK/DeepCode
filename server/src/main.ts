import { NestFactory } from '@nestjs/core';
import { AppModule } from './modules/app.module';
import * as cookieParser from 'cookie-parser';


async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // Enable cookie parser for JWT cookies
  app.use(cookieParser());
  
  // Configure CORS with specific origins
  app.enableCors({
    origin: [
      'http://localhost:3000', // Development
    ],
    credentials: true, // Allow cookies to be sent
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  });
  
  await app.listen(process.env.PORT || 8000);

  console.log(`🚀 Server running on http://localhost:${process.env.PORT || 8000}`);
}
bootstrap();