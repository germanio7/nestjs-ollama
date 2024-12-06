import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom, lastValueFrom } from 'rxjs';
import { ConfigService } from '@nestjs/config';
import { Queue } from 'bullmq';
import { InjectQueue } from '@nestjs/bullmq';
@Injectable()
export class ExternalApiService {
  constructor(
    private readonly httpService: HttpService,
    private configService: ConfigService,
    @InjectQueue('messageQueue') private messageQueue: Queue
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

      const job = await this.messageQueue.add('sendMessage', {
        to: '54' + phone_number,
        prompt: message
      });

      return;
    } catch (error) {
      console.error('Error enviando whatsapp:', error);
      return;
    }
  }
}
