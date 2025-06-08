import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHello(): Record<string, any> {
    return {
      status: 'ok',
      timeStamp: new Date().toISOString(),
      statusCode: 200,
      service: 'Deepcode'
    };
  }
}
