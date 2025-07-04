import { NestFactory } from '@nestjs/core';
import { AppModule } from './modules/app.module';
import * as cookieParser from 'cookie-parser';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // Enable cookie parser for JWT cookies
  app.use(cookieParser());
  
  // Configure CORS with dynamic origin handling
  app.enableCors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps or curl requests)
      if (!origin) return callback(null, true);
      
      // Allow all origins in development
      if (process.env.STAGE !== 'Production') {
        return callback(null, true);
      }
      
      // In production, allow specific origins
      const allowedOrigins = [
        'https://api.deepcode-server.xyz',
        'https://deepcode-server.xyz',
        'https://www.deepcode-server.xyz',
        // Add your production frontend domain here
      ];
      
      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      
      return callback(new Error('Not allowed by CORS'));
    },
    credentials: true, // Allow cookies to be sent
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
    allowedHeaders: [
      'Content-Type', 
      'Authorization', 
      'Cookie', 
      'X-Requested-With',
      'Accept',
      'Origin'
    ],
    exposedHeaders: ['Set-Cookie'],
    optionsSuccessStatus: 200, // For legacy browser support
    preflightContinue: false,
  });
  
  await app.listen(process.env.PORT || 8000);

  console.log(`🚀 Server running on http://localhost:${process.env.PORT || 8000}`);
  console.log(`🌍 CORS enabled for ${process.env.STAGE === 'Production' ? 'production origins' : 'all origins'}`);
}
bootstrap();