import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import { ExpressAdapter } from '@nestjs/platform-express';
import express from 'express';

// Tạo instance express bên ngoài để dùng chung
const server = express();

// Root route (Trước khi NestJS chiếm quyền) để người dùng không thấy "Cannot GET /"
server.get('/', (req, res) => {
  res.send({ status: 'ok', info: 'WordFlow API is running. Please use /api prefix.' });
});

let isInitialized = false;

async function bootstrap() {
  if (isInitialized) return;

  // Sử dụng ExpressAdapter để Vercel có thể handle
  const app = await NestFactory.create(
    AppModule,
    new ExpressAdapter(server),
  );

  app.enableCors({ origin: '*' });
  app.setGlobalPrefix('api');

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  await app.init();
  isInitialized = true;
}

// Chạy khởi tạo ngay lập tức (cho local hoặc cold starts trên Vercel)
const bootstrapPromise = bootstrap();

// Export handler cho Vercel sử dụng
export default async (req: any, res: any) => {
  // Đảm bảo bootstrap đã hoàn thành trước khi xử lý bất kỳ request nào
  await bootstrapPromise;
  server(req, res);
};