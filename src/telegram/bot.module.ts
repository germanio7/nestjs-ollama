import { Module } from '@nestjs/common';
import { TelegrafModule } from 'nestjs-telegraf';
import { ConfigModule } from '@nestjs/config';
import { ConfigService } from '@nestjs/config';

@Module({
  imports: [
    TelegrafModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        token: configService.get<string>('TELEGRAM_BOT_TOKEN'),
        launchOptions: {
          webhook: {
            domain: configService.get<string>('TELEGRAM_WEBHOOK_DOMAIN'),
            path: '/secret-path',
          },
        },
      }),
      inject: [ConfigService],
    }),
  ],
})
export class BotModule {}