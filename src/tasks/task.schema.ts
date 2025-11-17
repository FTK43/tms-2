import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type TaskDocument = TaskMongo & Document;

@Schema({
  collection: 'tasks',
  timestamps: {
    createdAt: 'createdAt',
  },
})
export class TaskMongo {
  @Prop({ required: true, maxLength: 255 })
  title: string;

  @Prop({ default: false })
  completed: boolean;

  @Prop({ required: true, index: true })
  ownerId: string;

  @Prop()
  createdAt: Date;

  @Prop({ default: null })
  updatedAt?: Date | null;

  @Prop({ default: null })
  deletedAt?: Date | null;
}

export const TaskSchema = SchemaFactory.createForClass(TaskMongo);

TaskSchema.index({ ownerId: 1, completed: 1 });
