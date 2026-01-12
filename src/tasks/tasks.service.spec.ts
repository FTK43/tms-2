import { Test, TestingModule } from '@nestjs/testing';
import { TasksService } from './tasks.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Task } from './task.entity';
import { getQueueToken } from '@nestjs/bull';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { DataSource } from 'typeorm';
import { CreateTaskDto } from './dto/create-task.dto';
import { ConflictException } from '@nestjs/common';

describe('TasksService', () => {
  let service: TasksService;

  const repo = {
    find: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
    merge: jest.fn(),
    findOne: jest.fn(),
    softDelete: jest.fn(),
  };

  const cache = {
    get: jest.fn(),
    set: jest.fn(),
  };

  const queue = {
    add: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TasksService,
        { provide: getRepositoryToken(Task), useValue: repo },
        { provide: getQueueToken('tasks'), useValue: queue },
        { provide: CACHE_MANAGER, useValue: cache },
        { provide: DataSource, useValue: {} },
      ],
    }).compile();

    service = module.get<TasksService>(TasksService);
  });

  it('findAll return tasks from repo', async () => {
    const tasks = [{ id: 't1', title: 'Task 1', completed: false }];
    repo.find.mockResolvedValue(tasks);

    const result = await service.findAll();

    expect(result).toEqual(tasks);
    expect(repo.find).toHaveBeenCalled();
  });

  it('throws ConflictException when title already exists', async () => {
    repo.find.mockResolvedValue([{ id: 't1', title: 'existing' }]);
    const dto: CreateTaskDto = {
      title: 'existing',
      userId: 'u1',
      completed: true,
    };

    await expect(service.create(dto)).rejects.toBeInstanceOf(ConflictException);
    expect(repo.create).not.toHaveBeenCalled();
    expect(repo.save).not.toHaveBeenCalled();
  });
});
