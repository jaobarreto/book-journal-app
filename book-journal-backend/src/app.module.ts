import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { BooksModule } from './books/books.module';

@Module({
  imports: [
    // Carrega as variáveis de ambiente do arquivo .env
    ConfigModule.forRoot({
      isGlobal: true, // Torna as variáveis disponíveis em toda a aplicação
    }),

    // Conecta com o MongoDB usando a URI do .env
    MongooseModule.forRoot(
      process.env.MONGODB_URI || 'mongodb://localhost:27017/book-journal',
    ),

    // Importa o módulo de books
    BooksModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
