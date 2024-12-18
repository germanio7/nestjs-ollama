import {
  Body,
  Controller,
  Get,
  Post,
  Query,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { v4 as uuidv4 } from 'uuid';
import { extname } from 'path';
import { ExternalApiService } from './external-api.service';
import * as fs from 'fs';

@Controller('external-api')
export class ExternalApiController {
  constructor(private readonly externalApiService: ExternalApiService) {}

  @Post('send-prompt')
  async sendPrompt(@Body() bodyData: any) {
    return await this.externalApiService.sendPrompt(bodyData.prompt);
  }

  @Post('chat')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: './uploads',
        filename: (req, file, cb) => {
          const fileExtName = extname(file.originalname);
          const randomName = uuidv4();
          cb(null, `${randomName}${fileExtName}`);
        },
      }),
    }),
  )
  async chat(@Body() bodyData: any, @UploadedFile() file: any) {
    const fileBuffer = fs.readFileSync(file.path);
    const base64Encoded = fileBuffer.toString('base64');
    return await this.externalApiService.chat(bodyData.message, base64Encoded);
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
