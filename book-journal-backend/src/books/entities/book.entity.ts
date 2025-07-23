import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type BookDocument = Book & Document;

@Schema({
  timestamps: true,
})
export class Book {
  @Prop({ required: true })
  nome: string;

  @Prop({ required: true })
  autor: string;

  @Prop()
  anoLancamento?: number;

  @Prop()
  minhaOpiniao?: string;

  @Prop()
  imagemCapa?: string;

  @Prop({ min: 1, max: 5 })
  nota?: number;
}

export const BookSchema = SchemaFactory.createForClass(Book);
