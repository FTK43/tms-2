import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { TasksService } from '../../tasks/tasks.service';
import { RequestWithUser } from '../middlewares/user-context.middleware';

@Injectable()
export class TaskOwnerOrAdminGuard implements CanActivate {
  constructor(private readonly tasksService: TasksService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest<RequestWithUser>();

    const user = req.user;
    const taskId = req.params.id;

    if (!user || !user.id) {
      throw new ForbiddenException('No User Context');
    }

    if (user.role === 'admin') {
      return true;
    }

    const task = await this.tasksService.findOne(taskId);

    if (!task) {
      throw new ForbiddenException('Task not found or access denied');
    }

    if (task.ownerId !== user.id) {
      throw new ForbiddenException('You are not the owner of this task');
    }

    return true;
  }
}
