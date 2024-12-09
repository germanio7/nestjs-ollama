import { InjectQueue } from '@nestjs/bullmq';
import { Injectable } from '@nestjs/common';
import { Queue } from 'bullmq';
import { ExternalApiService } from 'src/external-api/external-api.service';
// import { Context } from 'telegraf';

@Injectable()
export class BotService {
  constructor(
    private readonly externalApiservice: ExternalApiService,
    @InjectQueue('messageQueue') private messageQueue: Queue,
  ) {}

  handleStart(ctx) {
    ctx.reply('Bienvenido');
  }

  async handleTextMessage(ctx) {
    console.log(ctx.message.text);
    await this.messageQueue.add('sendMessage', {
      message: ctx.message.text,
      telegram_id: ctx.message.chat.id,
    });
  }
}
