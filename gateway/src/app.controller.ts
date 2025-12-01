import { Controller, Get, Inject, Param, Post } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { lastValueFrom } from 'rxjs';

@Controller()
export class AppController {
  constructor(@Inject('USER_SERVICE') private client: ClientProxy) {}

  @Get(':id')
  getUser(@Param('id') id: number) {
    return lastValueFrom(this.client.send('get-user', { id }));
  }

  @Post()
  createUser() {
    this.client.emit('user-created', { id: Date.now() });
    return { status: 'ok' };
  }
}
