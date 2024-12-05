import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class ExternalApiService {
  constructor(
    private readonly httpService: HttpService,
    private configService: ConfigService,
  ) {}

  async sendData(bodyData: any) {
    const apiUrl = this.configService.get<string>('OLLAMA_API_URL');

    const { data } = await firstValueFrom(
      this.httpService.post(`${apiUrl}/api/generate`, bodyData),
    );
    return data;
  }

  async handleWebhook(payload: any) {
    try {
      console.log('Webhook recibido:', payload);

      return payload.hub_challenge;
    } catch (error) {
      console.error('Error procesando webhook:', error);
      throw error;
    }
  }
}
