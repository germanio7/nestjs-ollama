import { Injectable } from '@nestjs/common';
import { Context } from 'telegraf';

@Injectable()
export class BotService {
  handleTextMessage(ctx) {
    ctx.reply(`Has asdcasdcsd: ${ctx.message.text}`);
  }
}
