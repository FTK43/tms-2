import { Controller } from '@nestjs/common';
import { AppService } from './app.service';
import { EventPattern, MessagePattern, Payload } from '@nestjs/microservices';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @MessagePattern('get-user')
  handleGetUser(@Payload() data: { id: number }) {
    return { id: data.id, name: 'John Doe' };
  }

  @EventPattern('user-created')
  handleUserCreated(@Payload() data: any) {
    console.log('[user-service] user created event received:', data);
  }
}
