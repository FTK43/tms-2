import { Module } from '@nestjs/common';
import { TasksController } from './tasks.controller';
import { TasksService } from './tasks.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Task } from './task.entity';
import { BullModule } from '@nestjs/bull';
import { TasksCacheProcessor } from './tasks-cache.processor';
import { FileStorageModule } from '../file-storage/file-storage.module';
import { TasksResolver } from './tasks.resolver';
import { TaskByIdLoader } from './tasks-by-id.loader';
import { UsersModule } from '../users/users.module';
import { PubSub } from 'graphql-subscriptions';
import { TasksSubscriptionResolver } from './tasks.subscription.resolver';

@Module({
  imports: [
    TypeOrmModule.forFeature([Task]),
    BullModule.registerQueue({ name: 'tasks' }),
    FileStorageModule,
    UsersModule,
  ],
  controllers: [TasksController],
  providers: [
    TasksService,
    TasksResolver,
    TasksSubscriptionResolver,
    TaskByIdLoader,
    TasksCacheProcessor,
    {
      provide: 'PUB_SUB',
      useValue: new PubSub(),
    },
  ],
  exports: [TasksService],
})
export class TasksModule {}
