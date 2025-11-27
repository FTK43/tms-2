import { IsEmail, IsNumber, IsString, MinLength } from 'class-validator';
import { IsAdult } from '../../common/validators/is-adult.validator';

export class CreateUserDto {
  @IsString()
  @MinLength(2)
  name: string;

  @IsEmail()
  email: string;

  @IsNumber()
  @IsAdult(18 /*, { message: 'Пользователь должен быть совершеннолетним' }*/)
  age: number;
}
