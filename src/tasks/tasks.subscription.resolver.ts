import { Resolver, Subscription } from '@nestjs/graphql';
import { PubSub } from 'graphql-subscriptions';
import { TaskType } from './task.type';
import { Inject } from '@nestjs/common';

@Resolver(() => TaskType)
export class TasksSubscriptionResolver {
  constructor(@Inject('PUB_SUB') private readonly pubSub: PubSub) {}

  @Subscription(() => TaskType, {
    name: 'taskCreated',
  })
  taskCreated() {
    return this.pubSub.asyncIterableIterator('taskCreated');
  }
}
