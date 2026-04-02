import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Enable CORS for frontend integration
  app.enableCors();

  // Tiền tố API nếu bạn muốn (ví dụ: domain.com/api/...)
  app.setGlobalPrefix('api');

  // Apply Global Validation Pipe for DTOs (using class-validator)
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // Vercel deployment usually handles porting, local uses 3000
  const port = process.env.PORT || 3000;
  await app.listen(port);
  console.log(`Application is running on: http://localhost:${port}`);

  await app.init(); // Quan trọng: Khởi tạo app mà không cần listen port cố định trên Vercel
  return app.getHttpAdapter().getInstance();
}

bootstrap();
