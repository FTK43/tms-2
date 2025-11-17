import { Module } from '@nestjs/common';
import { CacheModule, CacheInterceptor } from '@nestjs/cache-manager';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { TasksController } from './tasks.controller';
import { TasksService } from './tasks.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Task } from './task.entity';
import { MongooseModule } from '@nestjs/mongoose';
import { TaskMongo, TaskSchema } from './task.schema';

@Module({
  imports: [
    CacheModule.register({
      ttl: 20,
      // isGlobal: true,
    }),
    TypeOrmModule.forFeature([Task]),
    MongooseModule.forFeature([{ name: TaskMongo.name, schema: TaskSchema }]),
  ],
  controllers: [TasksController],
  providers: [
    TasksService,
    {
      provide: APP_INTERCEPTOR,
      useClass: CacheInterceptor,
    },
  ],
  exports: [TasksService],
})
export class TasksModule {}
