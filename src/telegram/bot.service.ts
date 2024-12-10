import { InjectQueue } from '@nestjs/bullmq';
import { Injectable } from '@nestjs/common';
import { Queue } from 'bullmq';

@Injectable()
export class BotService {
  constructor(@InjectQueue('messageQueue') private messageQueue: Queue) {}

  handleStart(ctx) {
    ctx.reply('Bienvenido');
  }

  async handleTextMessage(ctx) {
    await this.messageQueue.add('sendMessage', {
      message: ctx.message.text,
      telegram_id: ctx.message.chat.id,
    });
  }
}
