import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { getBotToken } from 'nestjs-telegraf';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const bot = app.get(getBotToken());

  app.setGlobalPrefix('api');
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
    }),
  );

  app.use(bot.webhookCallback('/secret-path'));

  // bot.on('text', (ctx) => ctx.reply(`Has dicho: ${ctx.message.text}`));

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
