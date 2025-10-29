import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { TasksService } from '../tasks/tasks.service';
import { AUTH_OPTIONS, AuthModuleOptions } from './auth.module';

@Injectable()
export class AuthService {
  constructor(
    @Inject(AUTH_OPTIONS) private readonly opts: AuthModuleOptions,
    @Inject(forwardRef(() => TasksService))
    private readonly tasksService: TasksService,
  ) {}

  issueToken(userId: string): string {
    const prefix = this.opts.tokenPrefix ?? 'Bearer';
    const payload = Buffer.from(`${userId}:${this.opts.secret}`).toString(
      'base64',
    );

    return `${prefix} ${payload}`;
  }

  verifyToken(token: string): string {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const [_prefix, encoded] = token.split(' ');
    const decoded = Buffer.from(encoded, 'base64').toString('utf8');
    //userid:secret
    const [userId, secret] = decoded.split(':');

    if (secret !== this.opts.secret) {
      throw new Error('invalid token');
    }

    return userId;
  }

  async assertTaskOwner(taskId: string, token: string) {
    const userId = this.verifyToken(token);
    const task = await this.tasksService.findOne(taskId);
    if (task.ownerId !== userId) {
      throw new Error('access denied');
    }

    return userId;
  }
}
