import { Injectable, Scope } from '@nestjs/common';
// eslint-disable-next-line @typescript-eslint/no-require-imports
import DataLoader = require('dataloader');
import { UserType } from './user.type';
import { UsersService } from './users.service';

@Injectable({ scope: Scope.REQUEST })
export class UserByIdLoader {
  constructor(private readonly usersService: UsersService) {}

  public readonly loader = new DataLoader<string, UserType | null>(
    async (ids) => {
      const users = this.usersService.findByIds(ids as string[]);

      const map = new Map(users.map((u) => [u.id, u]));

      return ids.map((id) => map.get(id) ?? null);
    },
  );
}
