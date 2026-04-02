import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import { ExpressAdapter } from '@nestjs/platform-express';
import express from 'express';

// Tạo instance express bên ngoài để dùng chung
const server = express();

async function bootstrap() {
  // Sử dụng ExpressAdapter để Vercel có thể handle
  const app = await NestFactory.create(
    AppModule,
    new ExpressAdapter(server),
  );

  app.enableCors();
  app.setGlobalPrefix('api');

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  await app.init();
}

// Chạy khởi tạo
bootstrap();

// Export handler cho Vercel
export default (req: any, res: any) => {
  server(req, res);
};