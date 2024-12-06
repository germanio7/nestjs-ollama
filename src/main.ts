import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { getBotToken } from 'nestjs-telegraf';
import { BotService } from './telegram/bot.service';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const bot = app.get(getBotToken());
  const botService = app.get(BotService);

  app.setGlobalPrefix('api');
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
    }),
  );

  app.use(bot.webhookCallback('/secret-path'));

  bot.on('text', (ctx) => botService.handleTextMessage(ctx));
  bot.on('message', (ctx) => botService.handleTextMessage(ctx));
  bot.start((ctx) => botService.handleStart(ctx)); // no funca

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
