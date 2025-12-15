import { Process, Processor } from '@nestjs/bull';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import type { Cache } from '@nestjs/cache-manager';
import { Inject } from '@nestjs/common';
import { Job } from 'bull';

type InvalidateTaskCacheJob = {
  taskId: string;
};

@Processor('tasks')
export class TasksCacheProcessor {
  constructor(@Inject(CACHE_MANAGER) private readonly cache: Cache) {}

  @Process('invalidate-task-cache')
  async invalidateTaskCache(job: Job<InvalidateTaskCacheJob>) {
    const { taskId } = job.data;

    const key = `tasks:${taskId}`;
    await this.cache.del(key);

    await job.log?.(`Cache Invalidated: ${key}`);
  }
}
