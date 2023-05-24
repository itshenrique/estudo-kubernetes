import { IsNotEmpty, IsString } from 'class-validator';

export class LogDto {
  @IsNotEmpty()
  @IsString()
  application: string;

  @IsNotEmpty()
  @IsString()
  message: string;
}
