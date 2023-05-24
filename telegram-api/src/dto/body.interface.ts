import { IsNotEmpty, IsString, Length } from 'class-validator';

export class SendMessageTelegramBodyDto {
  @IsNotEmpty()
  telegramId: number;

  @IsNotEmpty()
  @IsString()
  @Length(5, 20)
  message: string;
}
