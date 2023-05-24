import { Body, Controller, Post } from '@nestjs/common';
import { LogDto } from './dto/body.interface';
import { AppService } from './app.service';

@Controller('/log')
export class AppController {
  constructor(private appService: AppService) {}

  @Post('/send')
  sendMessage(@Body() body: LogDto) {
    return this.appService.sendMessage(body);
  }
}
