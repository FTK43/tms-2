import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Task } from './task.entity';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, In, Repository } from 'typeorm';

@Injectable()
export class TasksService {
  constructor(
    @InjectRepository(Task)
    private readonly taskRepo: Repository<Task>,
    private readonly dataSource: DataSource,
  ) {}

  async create(dto: CreateTaskDto): Promise<Task> {
    const task = this.taskRepo.create({
      title: dto.title,
      completed: dto.completed ?? false,
      ownerId: dto.userId,
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
    const task = await this.taskRepo.findOne({
      where: { id },
      withDeleted: false,
    });

    if (!task) {
      throw new NotFoundException(`Task ${id} - not found`);
    }

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

    return this.taskRepo.save(task);
  }

  async remove(id: string): Promise<void> {
    const res = await this.taskRepo.softDelete({ id });

    if (!res.affected) {
      throw new NotFoundException('Task not found');
    }
  }

  async complete(id: string) {
    const task = await this.getOwnedTask(id);

    if (task.completed) {
      return task;
    }

    task.completed = true;

    return this.taskRepo.save(task);
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
    } catch (e) {
      console.log(e);

      await runner.rollbackTransaction();
      throw e;
    } finally {
      await runner.release();
    }
  }

  toHateoas(task: Task) {
    return {
      ...task,
      _links: {
        self: { href: `/tasks/${task.id}` },
        update: { href: `/tasks/${task.id}`, method: 'PATCH' },
        delete: { href: `/tasks/${task.id}`, method: 'DELETE' },
        complete: { href: `/tasks/${task.id}/complete`, method: 'PATCH' },
      },
    };
  }
}
