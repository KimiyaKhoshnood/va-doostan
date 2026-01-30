import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHello(): object {
    return {
      id: 1,
      title: 'wellcome',
    };
  }
}
