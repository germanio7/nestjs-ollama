import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { ExternalApiService } from './external-api/external-api.service';
import { ExternalApiController } from './external-api/external-api.controller';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { BullModule } from '@nestjs/bullmq';
import { ExternalApiProcessor } from './external-api/external-api.processor';
import { BotModule } from './telegram/bot.module';
import { BotService } from './telegram/bot.service';
import { Telegraf } from 'telegraf';

@Module({
  imports: [
    HttpModule,
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    BullModule.forRootAsync({
      useFactory: (configService: ConfigService) => ({
        connection: {
          host: configService.get<string>('BULL_HOST'),
          port: parseInt(configService.get<string>('BULL_PORT'), 10),
        },
      }),
      inject: [ConfigService],
    }),
    BullModule.registerQueue({
      name: 'messageQueue',
    }),
    BotModule,
  ],
  controllers: [ExternalApiController],
  providers: [ExternalApiService, ExternalApiProcessor, BotService, Telegraf],
  exports: [ExternalApiService, BotService],
})
export class AppModule {}
