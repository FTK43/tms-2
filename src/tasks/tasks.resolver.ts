import {
  Args,
  ID,
  Mutation,
  Parent,
  Query,
  ResolveField,
  Resolver,
} from '@nestjs/graphql';
import { TaskType } from './task.type';
import { TasksService } from './tasks.service';
import { CreateTaskInput } from './create-task.input';
import { UpdateTaskInput } from './update-task.input';
import { TaskByIdLoader } from './tasks-by-id.loader';
import { UserType } from '../users/user.type';
import { UserByIdLoader } from '../users/user-by-id.loader';
import { Inject } from '@nestjs/common';
import { PubSub } from 'graphql-subscriptions';

@Resolver(() => TaskType)
export class TasksResolver {
  constructor(
    private readonly tasksService: TasksService,
    private readonly taskByIdLoader: TaskByIdLoader,
    private readonly userByIdLoader: UserByIdLoader,
    @Inject('PUB_SUB') private readonly pubSub: PubSub,
  ) {}

  @Query(() => [TaskType], { name: 'tasks' })
  findAll() {
    return this.tasksService.findAll();
  }

  @Query(() => TaskType, { name: 'task' })
  findOne(@Args('id', { type: () => ID }) id: string) {
    // return this.tasksService.findOne(id);
    return this.taskByIdLoader.loader.load(id);
  }

  @Mutation(() => TaskType)
  async createTask(@Args('input') input: CreateTaskInput) {
    const task = await this.tasksService.create(input);

    await this.pubSub.publish('taskCreated', { taskCreated: task });

    return task;
  }

  @Mutation(() => TaskType)
  updateTask(@Args('input') input: UpdateTaskInput) {
    return this.tasksService.update(input.id, input);
  }

  @Mutation(() => Boolean)
  removeTask(@Args('id', { type: () => ID }) id: string) {
    return this.tasksService.remove(id).then(() => true);
  }

  @ResolveField(() => UserType, { name: 'owner' })
  owner(@Parent() task: TaskType) {
    // return this.usersService.findOne(task.ownerId);
    return this.userByIdLoader.loader.load(task.ownerId);
  }
}
