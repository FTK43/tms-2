import {
  forwardRef,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Task } from './task.entity';
import { CreateTaskDto } from './dto/create-task.dto';
import { randomUUID } from 'crypto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { AuthService } from '../auth/auth.service';

@Injectable()
export class TasksService {
  constructor(
    @Inject(forwardRef(() => AuthService))
    private readonly auth: AuthService,
  ) {}

  private tasks: Task[] = [];

  findAll(): Task[] {
    return this.tasks;
  }

  async findOne(id: string): Promise<Task> {
    const task = this.tasks.find((t) => t.id === id);
    if (!task) {
      throw new NotFoundException(`Task ${id} - not found`);
    }

    return task;
  }

  create(dto: CreateTaskDto, userId: string): Task {
    this.auth.issueToken(userId);

    const task: Task = {
      id: randomUUID(),
      title: dto.title,
      completed: dto.completed ?? false,
      ownerId: userId,
    };
    this.tasks.push(task);

    console.log(`Task created by ${userId}`);

    return task;
  }

  async update(id: string, dto: UpdateTaskDto, token?: string): Promise<Task> {
    await this.auth.assertTaskOwner(id, token);
    const task = await this.findOne(id);

    if (dto.title !== undefined) {
      task.title = dto.title;
    }
    if (dto.completed !== undefined) {
      task.completed = dto.completed;
    }

    return task;
  }

  async remove(id: string, token: string): Promise<void> {
    await this.auth.assertTaskOwner(id, token);
    const idx = this.tasks.findIndex((t) => t.id === id);
    if (idx === -1) {
      throw new NotFoundException(`Task ${id} - not found`);
    }
    this.tasks.splice(idx, 1);
  }
}
