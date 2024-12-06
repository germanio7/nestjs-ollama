import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { ExternalApiService } from './external-api/external-api.service';
import { ExternalApiController } from './external-api/external-api.controller';
import { ConfigModule } from '@nestjs/config';
import { BullModule } from '@nestjs/bullmq';
import { ExternalApiProcessor } from './external-api/external-api.rocessor';

@Module({
  imports: [
    HttpModule,
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    BullModule.forRoot({
      connection: {
        host: 'localhost',
        port: 6379,
      },
    }),
    BullModule.registerQueue({
      name: 'messageQueue', // Name of the queue
    }),
  ],
  controllers: [ExternalApiController],
  providers: [ExternalApiService, ExternalApiProcessor],
  exports: [ExternalApiService],
})
export class AppModule { }
