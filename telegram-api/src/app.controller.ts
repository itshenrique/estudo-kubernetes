import { Body, Controller, Post } from '@nestjs/common';
import { SendMessageTelegramBodyDto } from './dto/body.interface';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private appService: AppService) {}

  @Post('/send')
  sendMessage(@Body() body: SendMessageTelegramBodyDto) {
    return this.appService.sendMessage({
      telegramId: body.telegramId,
      message: body.message,
    });
  }
}
