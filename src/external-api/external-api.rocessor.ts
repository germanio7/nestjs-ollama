import { HttpService } from '@nestjs/axios';
import { Processor, WorkerHost } from '@nestjs/bullmq';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom, from, lastValueFrom } from 'rxjs';

@Processor('messageQueue')
export class ExternalApiProcessor extends WorkerHost {

    constructor(
        private readonly httpService: HttpService,
        private configService: ConfigService,
    ) {
        super()
    }

    async process(job: any) {
        const { from, message } = job.data;

        const phone_number = from.substring(3);

        const result = await this.sendData({
            model: 'llama3.2',
            prompt: message,
            stream: false,
        });


        const apiUrl = this.configService.get<string>('WHATSAPP_URL');
        const token = this.configService.get<string>('WHATSAPP_TOKEN');

        const params = {
            messaging_product: 'whatsapp',
            recipient_type: 'individual',
            to: '54' + phone_number,
            type: 'text',
            text: {
                preview_url: false,
                body: result.response,
            },
        };

        try {
            await lastValueFrom(
                this.httpService.post(`${apiUrl}`, params, {
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${token}`,
                    },
                }),
            );
        } catch (error) {
            console.log('errorjob', error);
        }

    }

    async sendData(bodyData: any) {
        const apiUrl = this.configService.get<string>('OLLAMA_API_URL');

        const { data } = await firstValueFrom(
            this.httpService.post(`${apiUrl}/api/generate`, bodyData),
        );
        return data;
    }
}