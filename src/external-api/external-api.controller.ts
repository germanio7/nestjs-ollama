import { Body, Controller, Post } from '@nestjs/common';
import { ExternalApiService } from './external-api.service';

@Controller('external-api')
export class ExternalApiController {
    constructor(private readonly externalApiService: ExternalApiService) {}

  @Post('ollama')
  async sendData(@Body() bodyData: any) {
    return await this.externalApiService.sendData(bodyData);
  }
    
  @Post('receive')
  async receiveWebhook(@Body() payload: any) {
      return this.externalApiService.handleWebhook(payload);
  }
}
