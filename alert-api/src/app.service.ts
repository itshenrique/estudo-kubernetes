import { Inject, Injectable } from '@nestjs/common';
import * as TelegramBot from 'node-telegram-bot-api';
import { LogMongoRepository } from './entity/series/log.repository';
import { LogDto } from './dto/body.interface';
import { telegramApi } from './infra/config';

const MAX_LOG_LENGTH = 3000;

@Injectable()
export class AppService {
  private telegramBot: TelegramBot;

  constructor(
    @Inject('LogRepository')
    private readonly logMongoRepository: LogMongoRepository,
  ) {}

  async sendMessage(body: LogDto) {
    this.telegramBot = new TelegramBot(telegramApi.token, { polling: false });
    const formattedMessage = JSON.stringify(body, null, 2);
    const messageToSend = [
      '<b>Log de erro</b>',
      formattedMessage.length > MAX_LOG_LENGTH
        ? formattedMessage.slice(0, MAX_LOG_LENGTH) + '..."'
        : formattedMessage,
    ].join('\n');

    this.telegramBot.sendMessage(telegramApi.telegramUserId, messageToSend, {
      parse_mode: 'HTML',
    });
    await this.logMongoRepository.save(body);
  }
}
