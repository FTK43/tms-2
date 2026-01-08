import { Injectable } from '@nestjs/common';
import { UserType } from './user.type';

const USERS: UserType[] = [
  { id: 'u1', name: 'Andrey' },
  { id: 'u2', name: 'Fedor' },
  { id: 'u3', name: 'Anna' },
];

@Injectable()
export class UsersService {
  findOne(id: string): UserType | null {
    return USERS.find((u) => u.id === id) ?? null;
  }

  findByIds(ids: readonly string[]): UserType[] {
    const map = new Map(USERS.map((u) => [u.id, u]));
    return ids.map((id) => map.get(id)).filter(Boolean);
  }
}
