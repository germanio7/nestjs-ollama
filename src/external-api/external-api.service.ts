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
    @InjectQueue('messageQueue') private messageQueue: Queue,
  ) {}

  async sendPrompt(prompt: string) {
    const apiUrl = this.configService.get<string>('OLLAMA_API_URL');
    const { data } = await firstValueFrom(
      this.httpService.post(`${apiUrl}/api/generate`, {
        model: 'llama3.2',
        system: 'Eres un experto en el tema. Responde siempre en español.',
        options: { temperature: 0.2 },
        prompt: prompt,
        stream: false,
      }),
    );
    return data;
  }

  async chat(message: string) {
    let messages = [
      {
        role: 'system',
        content:
          'Eres un recepcionista del hotel Bariloche, de la ciuidad de Villa Angela Chaco Argentina. Responde siempre en español y de manera amable.',
      },
      {
        role: 'user',
        content: message,
      },
    ];

    const data = await this.makeChatRequest(messages);

    let response = data;

    if (data.message.tool_calls && data.message.tool_calls.length > 0) {
      if (
        data.message.tool_calls[0].function.arguments.current_date == 'true'
      ) {
        const currentDate = new Date().toISOString().split('T')[0];

        messages.push({
          role: 'assistant',
          content: currentDate,
        });
        const data = await this.makeChatRequest(messages);

        response = data;
      }
    }

    return response;
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

        const job = await this.messageQueue.add('sendMessage', {
          from: from,
          message: message,
        });
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
      const result = await lastValueFrom(
        this.httpService.post(`${apiUrl}`, params, {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        }),
      );

      return result;
    } catch (error) {
      console.error('Error enviando whatsapp:', error);
      return;
    }
  }

  private async makeChatRequest(messages: Array<object>) {
    const apiUrl = this.configService.get<string>('OLLAMA_API_URL');
    const { data } = await firstValueFrom(
      this.httpService.post(`${apiUrl}/api/chat`, {
        model: 'llama3.2',
        tools: [
          {
            type: 'function',
            function: {
              name: 'fecha_actual',
              description: 'Obtiene la fecha actual',
              parameters: {
                type: 'boolean',
                properties: {
                  current_date: {
                    type: 'boolean',
                    description: 'Fecha actual',
                  },
                },
                required: ['current_date'],
              },
            },
          },
        ],
        options: { temperature: 0.2 },
        messages: messages,
        stream: false,
      }),
    );

    return data;
  }
}
