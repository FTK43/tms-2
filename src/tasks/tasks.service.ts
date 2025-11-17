import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Task } from './task.entity';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { AuthService } from '../auth/auth.service';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { InjectModel } from '@nestjs/mongoose';
import { TaskDocument, TaskMongo } from './task.schema';
import { Model } from 'mongoose';

@Injectable()
export class TasksService {
  constructor(
    private readonly auth: AuthService,
    @InjectRepository(Task)
    private readonly taskRepo: Repository<Task>,
    private readonly dataSource: DataSource,
    @InjectModel(TaskMongo.name)
    private readonly taskModel: Model<TaskDocument>,
  ) {}

  async create(dto: CreateTaskDto): Promise<TaskMongo> {
    // this.auth.issueToken(userId);
    //const task = this.taskRepo.create({
    //  title: dto.title,
    //  completed: dto.completed ?? false,
    //  ownerId: dto.userId,
    //});
    //const savedTask = await this.taskRepo.save(task);
    //
    //return savedTask;

    const task = new this.taskModel({
      ownerId: dto.userId,
      title: dto.title,
      completed: dto.completed,
    });

    return task.save();
  }

  async findAll(): Promise<TaskMongo[]> {
    // return this.taskRepo.find({
    //   order: { createdAt: 'DESC' },
    // });
    return this.taskModel.find({});
  }

  async findOne(id: string): Promise<TaskMongo> {
    // const task = await this.taskRepo.findOne({ where: { id } });
    //
    // if (!task) {
    //   throw new NotFoundException(`Task ${id} - not found`);
    // }
    //
    // return task;

    const filter: any = { _id: id, deletedAt: null };

    return this.taskModel.findOne(filter).exec();
  }

  private async getOwnedTask(
    id: string,
    // token: string | undefined,
  ): Promise<TaskMongo> {
    // if (!token) {
    //   throw new UnauthorizedException('missing token');
    // }

    //const ownerId = this.auth.verifyToken(token);
    const task = await this.findOne(id);

    // if (task.ownerId !== ownerId) {
    //   throw new ForbiddenException('access denied');
    // }

    return task;
  }

  async update(id: string, dto: UpdateTaskDto): Promise<TaskMongo> {
    //const task = await this.getOwnedTask(id);
    //
    //console.log(JSON.stringify(task));
    //
    //this.taskRepo.merge(task, {
    //  title: dto.title ?? task.title,
    //  completed: dto.completed ?? task.completed,
    //});
    //
    //return this.taskRepo.save(task);

    const task = await this.taskModel
      .findOneAndUpdate(
        { _id: id, deletedAt: null },
        { $set: { title: dto.title } },
        { new: true },
      )
      .exec();

    if (!task) {
      throw new NotFoundException('Task not found');
    }

    return task;
  }

  async remove(id: string): Promise<void> {
    //const task = await this.getOwnedTask(id);
    // await this.taskRepo.softDelete(task.id);

    const res = await this.taskModel
      .updateOne(
        { _id: id, deletedAt: null },
        { $set: { deletedAt: new Date() } },
      )
      .exec();

    if (res.matchedCount === 0) {
      throw new NotFoundException('Task not found');
    }
  }

  async complete(id: string) {
    const task = await this.taskModel
      .findOneAndUpdate(
        { _id: id, deletedAt: null },
        { $set: { completed: true } },
        { new: true },
      )
      .exec();

    if (!task) {
      throw new NotFoundException('Task not found');
    }

    return task;
  }

  async completeMany(ids: string[]) {
    const tasks = await this.taskModel
      .find({
        _id: { $in: ids },
        deletedAt: null,
      })
      .exec();

    if (tasks.length !== ids.length) {
      throw new ForbiddenException('some tasks are not found');
    }

    await this.taskModel
      .updateMany(
        {
          _id: { $in: ids },
          deletedAt: null,
        },
        {
          $set: { completed: true },
        },
      )
      .exec();
  }

  /*async completeMany(ids: string[]) {
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
  }*/

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
