import { Module } from '@nestjs/common';
import { TelegrafModule } from 'nestjs-telegraf';
import { MyBot } from './my.bot';
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
                        domain: 'https://ea04-190-137-235-125.ngrok-free.app',
                        path: '/secret-path',
                    }
                }
            }),
            inject: [ConfigService],
        }),
    ],
    providers: [MyBot],
})
export class BotModule { }