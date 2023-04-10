import { Controller, Get } from '@nestjs/common';

@Controller({
  path: '/app',
})
export class AppController {
  @Get('/')
  getHello(): string {
    return 'Hello World!';
  }
}
