import { Controller, Get } from '@nestjs/common';

@Controller({
  path: 'api',
})
export class AppController {
  @Get('/')
  getHello(): string {
    return 'Hello World!';
  }
}
