import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { ExternalApiService } from './external-api/external-api.service';
import { ExternalApiController } from './external-api/external-api.controller';

@Module({
  imports: [HttpModule],
  controllers: [ExternalApiController],
  providers: [ExternalApiService],
  exports: [ExternalApiService]
})
export class AppModule {}
