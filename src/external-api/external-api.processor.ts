import { Processor, WorkerHost } from '@nestjs/bullmq';
import { ExternalApiService } from './external-api.service';
import { Telegraf } from 'telegraf';
import { ConfigService } from '@nestjs/config';

@Processor('messageQueue')
export class ExternalApiProcessor extends WorkerHost {
  constructor(
    private readonly externalApiservice: ExternalApiService,
    private bot: Telegraf,
    private configService: ConfigService,
  ) {
    super();
  }

  async process(job: any) {
    const { from, message, telegram_id } = job.data;
    const result = await this.externalApiservice.sendPrompt(message);

    try {
      if (from) {
        this.externalApiservice.sendWhatsapp(from, result.response);
      }
      if (telegram_id) {
        console.log(telegram_id);
        this.bot = new Telegraf(
          this.configService.get<string>('TELEGRAM_BOT_TOKEN'),
        );
        await this.bot.telegram.sendMessage(telegram_id, result.response);
      }
    } catch (error) {
      console.log('errorjob', error);
    }
  }
}
