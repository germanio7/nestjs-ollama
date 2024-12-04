import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class ExternalApiService {
    constructor(private readonly httpService: HttpService) {}

  async sendData(bodyData: any) {
    // Ejemplo usando JSONPlaceholder
    const { data } = await firstValueFrom(
        this.httpService.post('http://localhost:11434/api/generate', bodyData)
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
