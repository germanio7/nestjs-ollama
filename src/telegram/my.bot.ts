import { Injectable } from '@nestjs/common';
import { On } from 'nestjs-telegraf';

@Injectable()
export class MyBot {
    @On('text')
    async onText(ctx) {
        await ctx.reply('¡Hola! ¿Cómo puedo ayudarte?');
    }
}