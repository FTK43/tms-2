import { BadRequestException } from '@nestjs/common';
import { TaskStatus } from '../task-status.enum';
import { TaskStatusValidationPipe } from './task-status-validation.pipe';

describe('TaskStatusValidationPipe', () => {
  let pipe: TaskStatusValidationPipe;

  beforeEach(() => {
    pipe = new TaskStatusValidationPipe();
  });

  it('returns value when status is valid', () => {
    const result = pipe.transform(TaskStatus.TODO);
    expect(result).toBe(TaskStatus.TODO);
  });

  it('throws when status is invalid', () => {
    expect(() => pipe.transform('INVALID_STATUS')).toThrow(BadRequestException);
  });
});
