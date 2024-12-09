import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { ExternalApiService } from './external-api.service';

@Controller('external-api')
export class ExternalApiController {
    constructor(private readonly externalApiService: ExternalApiService) {}

  @Post('send-prompt')
  async sendPrompt(@Body() bodyData: any) {
    return await this.externalApiService.sendPrompt(bodyData.prompt);
  }
    
  @Get('whatsapp-webhook')
  async subscriptionWebhook(@Query() query: Record<string, string>) {
    return this.externalApiService.subscriptionWebhook(query);
  }

  @Post('whatsapp-webhook')
  async receiveWebhook(@Body() bodyData: any) {
    return this.externalApiService.receiveWebhook(bodyData);
  }
}
