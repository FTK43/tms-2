import { Args, ID, Mutation, Query, Resolver } from '@nestjs/graphql';
import { TaskType } from './task.type';
import { TasksService } from './tasks.service';
import { CreateTaskInput } from './create-task.input';
import { UpdateTaskInput } from './update-task.input';
import { TaskByIdLoader } from './tasks-by-id.loader';

@Resolver(() => TaskType)
export class TasksResolver {
  constructor(
    private readonly tasksService: TasksService,
    private readonly taskByIdLoader: TaskByIdLoader,
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
  createTask(@Args('input') input: CreateTaskInput) {
    return this.tasksService.create(input);
  }

  @Mutation(() => TaskType)
  updateTask(@Args('input') input: UpdateTaskInput) {
    return this.tasksService.update(input.id, input);
  }

  @Mutation(() => Boolean)
  removeTask(@Args('id', { type: () => ID }) id: string) {
    return this.tasksService.remove(id).then(() => true);
  }
}
