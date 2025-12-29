import { Field, InputType } from '@nestjs/graphql';
import { IsOptional, IsString, MinLength } from 'class-validator';

@InputType()
export class CreateTaskInput {
  @Field()
  @MinLength(3)
  @IsString()
  title: string;

  @Field()
  @MinLength(3)
  @IsString()
  userId: string;

  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  description?: string;

  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  status?: string;
}
