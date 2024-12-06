import { HttpService } from '@nestjs/axios';
import { Processor, WorkerHost } from '@nestjs/bullmq';
import { ConfigService } from '@nestjs/config';
import { lastValueFrom } from 'rxjs';

@Processor('messageQueue')
export class ExternalApiProcessor extends WorkerHost {

    constructor(
        private readonly httpService: HttpService,
        private configService: ConfigService,
    ) {
        super()
    }

    async process(job: any) {
        const { to, prompt } = job.data;

        const apiUrl = this.configService.get<string>('WHATSAPP_URL');
        const token = this.configService.get<string>('WHATSAPP_TOKEN');

        const params = {
            messaging_product: 'whatsapp',
            recipient_type: 'individual',
            to: to,
            type: 'text',
            text: {
                preview_url: false,
                body: prompt,
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
}