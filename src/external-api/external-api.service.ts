import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { ConfigService } from '@nestjs/config';
import { log } from 'console';

@Injectable()
export class ExternalApiService {
  constructor(
    private readonly httpService: HttpService,
    private configService: ConfigService,
  ) { }

  async sendData(bodyData: any) {
    const apiUrl = this.configService.get<string>('OLLAMA_API_URL');

    const { data } = await firstValueFrom(
      this.httpService.post(`${apiUrl}/api/generate`, bodyData),
    );
    return data;
  }

  async subscriptionWebhook(payload: any) {
    try {
      console.log("payload", payload);

      return payload['hub.challenge'];
    } catch (error) {
      console.error('Error procesando webhook:', error);
      throw error;
    }
  }

  async receiveWebhook(payload: any) {
    try {
      if (payload.entry[0].changes[0].value.messages[0].type == 'text') {
        const message = payload.entry[0].changes[0].value.messages[0].text.body;
        console.log(message);

        const result = await this.sendData({
          model: 'llama3.2',
          prompt: message,
          stream: false
        });

        console.log(result.response);
      }

      return;
    } catch (error) {
      console.error('Error procesando webhook:', error);
      throw error;
    }
  }
}
