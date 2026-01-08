import { Field, ID, ObjectType } from '@nestjs/graphql';
import { UserType } from '../users/user.type';

@ObjectType()
export class TaskType {
  @Field(() => ID)
  id: string;

  @Field()
  title: string;

  @Field({ nullable: true })
  description?: string;

  @Field()
  completed: boolean;

  @Field(() => ID)
  ownerId: string;

  @Field(() => UserType, { nullable: true })
  owner?: UserType | null;
}
