import { Module } from '@nestjs/common';
import { TasksController } from './tasks.controller';
import { TasksService } from './tasks.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Task } from './task.entity';
import { BullModule } from '@nestjs/bull';
import { TasksCacheProcessor } from './tasks-cache.processor';
import { FileStorageModule } from '../file-storage/file-storage.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Task]),
    BullModule.registerQueue({ name: 'tasks' }),
    FileStorageModule,
  ],
  controllers: [TasksController],
  providers: [TasksService, TasksCacheProcessor],
  exports: [TasksService],
})
export class TasksModule {}
