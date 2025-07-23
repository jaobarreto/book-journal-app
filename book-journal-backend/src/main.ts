import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Habilita validação global usando os DTOs
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // Remove propriedades que não estão no DTO
      forbidNonWhitelisted: true, // Retorna erro se propriedades extras forem enviadas
      transform: true, // Transforma os tipos automaticamente
    }),
  );

  // Habilita CORS para comunicação com o frontend
  app.enableCors();

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
