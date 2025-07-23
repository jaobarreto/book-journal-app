import { IsString, IsOptional, IsNumber, Min, Max, IsNotEmpty } from 'class-validator';

export class CreateBookDto {
  @IsNotEmpty()
  @IsString()
  nome: string;

  @IsNotEmpty()
  @IsString()
  autor: string;

  @IsOptional()
  @IsNumber()
  anoLancamento?: number;

  @IsOptional()
  @IsString()
  minhaOpiniao?: string;

  @IsOptional()
  @IsString()
  imagemCapa?: string;

  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(5)
  nota?: number;
}
