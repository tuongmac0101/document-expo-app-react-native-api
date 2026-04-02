import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { ExpressAdapter } from '@nestjs/platform-express';
import express from 'express';

// Tạo instance express bên ngoài để dùng chung
const server = express();

// Root route (Trước khi NestJS chiếm quyền) để người dùng không thấy "Cannot GET /"
server.get('/', (req, res) => {
  res.send({ status: 'ok', info: 'WordFlow API is running. Please use /api prefix.' });
});


async function bootstrap() {

  // Sử dụng ExpressAdapter để Vercel có thể handle
  const app = await NestFactory.create(
    AppModule,
    new ExpressAdapter(server),
  );

  app.enableCors({ origin: '*' });
  app.setGlobalPrefix('api');

  // Swagger Documentation Setup
  const config = new DocumentBuilder()
    .setTitle('WordFlow API Docs')
    .setDescription('Tài liệu hướng dẫn sử dụng API cho cộng đồng WordFlow Q&A. Hỗ trợ hệ thống câu hỏi, trả lời và xác thực Google OAuth.')
    .setVersion('1.0')
    .addTag('auth', 'Hệ thống xác thực Google OAuth')
    .addTag('users', 'Quản lý thông tin người dùng')
    .addTag('questions', 'Hệ thống câu hỏi cộng đồng')
    .addTag('answers', 'Quản lý phản hồi và trả lời')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document, {
    swaggerOptions: {
      persistAuthorization: true,
    },
    customSiteTitle: 'WordFlow API Explorer',
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  await app.init();

  // NẾU KHÔNG PHẢI VERCEL (Local Dev), thì phải gọi listen để giữ process chạy
  if (!process.env.VERCEL) {
    const port = process.env.PORT || 3000;
    await app.listen(port);
    console.log(`Backend is running locally on: http://localhost:${port}`);
  }
}

// Chạy khởi tạo ngay lập tức (cho local hoặc cold starts trên Vercel)
const bootstrapPromise = bootstrap();

// Export handler cho Vercel sử dụng
export default async (req: any, res: any) => {
  // Đảm bảo bootstrap đã hoàn thành trước khi xử lý bất kỳ request nào
  await bootstrapPromise;
  server(req, res);
};