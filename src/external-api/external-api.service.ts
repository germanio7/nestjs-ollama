import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom, lastValueFrom } from 'rxjs';
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

  async subscriptionWebhook(payload: any) {
    try {
      return payload['hub.challenge'];
    } catch (error) {
      console.error('Error procesando webhook:', error);
      throw error;
    }
  }

  async receiveWebhook(payload: any) {
    try {
      if (
        payload.entry[0].changes[0].value.messages &&
        payload.entry[0].changes[0].value.messages[0].type == 'text'
      ) {
        const from = payload.entry[0].changes[0].value.messages[0].from;
        const message = payload.entry[0].changes[0].value.messages[0].text.body;

        const result = await this.sendData({
          model: 'llama3.2',
          prompt: message,
          stream: false,
        });

        const resultSendWhatsapp = await this.sendWhatsapp(
          from,
          result.response,
        );
      }

      return;
    } catch (error) {
      console.error('Error procesando webhook:', error);
      return;
    }
  }

  async sendWhatsapp(phone_number: string, message: string) {
    try {
      phone_number = phone_number.substring(3);

      const apiUrl = this.configService.get<string>('WHATSAPP_URL');
      const token = this.configService.get<string>('WHATSAPP_TOKEN');

      const params = {
        messaging_product: 'whatsapp',
        recipient_type: 'individual',
        to: '54' + phone_number,
        type: 'text',
        text: {
          preview_url: false,
          body: message,
        },
      };

      const { data } = await lastValueFrom(
        this.httpService.post(`${apiUrl}`, params, {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        }),
      );

      return data;
    } catch (error) {
      console.error('Error enviando whatsapp:', error);
      return;
    }
  }
}
