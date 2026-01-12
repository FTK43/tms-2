import {
  ConflictException,
  ForbiddenException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Task } from './task.entity';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, In, Repository } from 'typeorm';
import { Cache, CACHE_MANAGER } from '@nestjs/cache-manager';
import { InjectQueue } from '@nestjs/bull';
import type { Queue } from 'bull';

@Injectable()
export class TasksService {
  constructor(
    @InjectRepository(Task)
    private readonly taskRepo: Repository<Task>,
    private readonly dataSource: DataSource,
    @Inject(CACHE_MANAGER) private readonly cache: Cache,

    @InjectQueue('tasks')
    private readonly tasksQueue: Queue,
  ) {}

  private taskCacheKey(id: string) {
    return `tasks:${id}`;
  }

  private async enqueueInvalidateTaskCache(taskId: string) {
    await this.tasksQueue.add(
      'invalidate-task-cache',
      { taskId },
      {
        attempts: 5,
        backoff: { delay: 1000, type: 'exponential' },
        removeOnComplete: true,
      },
    );
  }

  async create(dto: CreateTaskDto): Promise<Task> {
    const tasks = await this.findAll();
    const existingTitles = tasks.map((t) => t.title);

    if (existingTitles.includes(dto.title)) {
      throw new ConflictException('Task with this title already exists');
    }

    const task = this.taskRepo.create({
      title: dto.title,
      completed: dto.completed ?? false,
      ownerId: dto.userId,
      // status: dto.status,
    });

    return this.taskRepo.save(task);
  }

  async findAll(): Promise<Task[]> {
    return this.taskRepo.find({
      where: { deletedAt: null },
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: string): Promise<Task> {
    const key = `tasks:${id}`;

    const cached = await this.cache.get<Task>(key);
    if (cached) {
      console.log('CACHE HIT', id);

      return cached;
    }

    console.log('DB CALL', id);
    const task = await this.taskRepo.findOne({
      where: { id },
      withDeleted: false,
    });

    if (!task) {
      throw new NotFoundException(`Task ${id} - not found`);
    }

    await this.cache.set(key, task, 300000);
    return task;
  }

  private async getOwnedTask(id: string): Promise<Task> {
    return this.findOne(id);
  }

  async update(id: string, dto: UpdateTaskDto): Promise<Task> {
    const task = await this.getOwnedTask(id);

    this.taskRepo.merge(task, {
      title: dto.title ?? task.title,
      completed: dto.completed ?? task.completed,
    });

    const saved = await this.taskRepo.save(task);

    this.enqueueInvalidateTaskCache(id);

    return saved;
  }

  async remove(id: string): Promise<void> {
    const res = await this.taskRepo.softDelete({ id });

    if (!res.affected) {
      throw new NotFoundException('Task not found');
    }

    this.enqueueInvalidateTaskCache(id);
  }

  async complete(id: string) {
    const task = await this.getOwnedTask(id);

    // if (task.completed) {
    //   return task;
    // }

    task.completed = true;

    const saved = await this.taskRepo.save(task);

    console.log('ID: ', id);

    await this.enqueueInvalidateTaskCache(id);

    return saved;
  }

  async completeMany(ids: string[]) {
    const runner = this.dataSource.createQueryRunner();
    await runner.connect();
    await runner.startTransaction();

    try {
      const tasks = await runner.manager.find(Task, {
        where: { id: In(ids) },
        withDeleted: false,
      });
      if (tasks.length !== ids.length) {
        throw new ForbiddenException('some tasks are not found');
      }

      await runner.manager
        .createQueryBuilder()
        .update(Task)
        .set({ completed: true })
        .whereInIds(ids)
        .execute();

      await runner.commitTransaction();

      await Promise.all(ids.map((id) => this.enqueueInvalidateTaskCache(id)));
    } catch (e) {
      console.log(e);

      await runner.rollbackTransaction();
      throw e;
    } finally {
      await runner.release();
    }
  }
}
