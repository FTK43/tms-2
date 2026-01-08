import { Injectable, Scope } from '@nestjs/common';
import { TasksService } from './tasks.service';
import DataLoader from 'dataloader';
import { Task } from './task.entity';

@Injectable({ scope: Scope.REQUEST })
export class TaskByIdLoader {
  constructor(private readonly tasksService: TasksService) {}

  public readonly loader = new DataLoader<string, Task | null>(async (ids) => {
    const tasks = await this.tasksService.findByIds(ids as string[]);

    const map = new Map(tasks.map((t) => [t.id, t]));

    return ids.map((id) => map.get(id) ?? null);
  });
}
