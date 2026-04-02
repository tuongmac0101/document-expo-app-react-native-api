import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';

let cachedApp: any;

async function bootstrap() {
  if (cachedApp) return cachedApp;

  const app = await NestFactory.create(AppModule);

  // Enable CORS for frontend integration
  app.enableCors();

  // Tiền tố API (Ví dụ: https://domain.com/api/...)
  app.setGlobalPrefix('api');

  // Apply Global Validation Pipe for DTOs (using class-validator)
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  if (process.env.NODE_ENV === 'production' || process.env.VERCEL) {
    await app.init();
    cachedApp = app.getHttpAdapter().getInstance();
    return cachedApp;
  }

  const port = process.env.PORT || 3000;
  await app.listen(port);
  console.log(`Application is running on: http://localhost:${port}`);
  return app;
}

// Chạy trực tiếp cho môi trường local (Development)
if (process.env.NODE_ENV !== 'production' && !process.env.VERCEL) {
  bootstrap();
}

// Export cho Vercel (Production)
export default async (req: any, res: any) => {
  const server = await bootstrap();
  return server(req, res);
};
