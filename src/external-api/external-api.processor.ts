import { Processor, WorkerHost } from '@nestjs/bullmq';
import { ExternalApiService } from './external-api.service';

@Processor('messageQueue')
export class ExternalApiProcessor extends WorkerHost {
  constructor(private readonly externalApiservice: ExternalApiService) {
    super();
  }

  async process(job: any) {
    const { from, message } = job.data;
    const result = await this.externalApiservice.sendData({
      model: 'llama3.2',
      prompt: message,
      stream: false,
    });

    try {
      this.externalApiservice.sendWhatsapp(from, result.response);
    } catch (error) {
      console.log('errorjob', error);
    }
  }
}
