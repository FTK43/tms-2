import { Type } from 'class-transformer';
import { ArrayNotEmpty, IsArray, IsUUID } from 'class-validator';

export class CompleteManyDto {
  @IsArray()
  @ArrayNotEmpty()
  @Type(() => String)
  @IsUUID('4', { each: true })
  ids!: string[];
}
