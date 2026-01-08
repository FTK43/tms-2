import { Module } from '@nestjs/common';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { UserByIdLoader } from './user-by-id.loader';

@Module({
  controllers: [UsersController],
  providers: [UsersService, UserByIdLoader],
  exports: [UsersService, UserByIdLoader],
})
export class UsersModule {}
