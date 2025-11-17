import { NextFunction, Request, Response } from 'express';

export interface RequestWithUser extends Request {
  user?: {
    id: string | null;
    role: 'guest' | 'user' | 'admin';
  };
}

export function UserContextMiddleware(
  req: RequestWithUser,
  res: Response,
  next: NextFunction,
) {
  const userId = req.headers['x-user-id'] as string | undefined;
  const userRole =
    (req.headers['x-user-role'] as string | undefined) || 'guest';

  req.user = {
    id: userId ?? null,
    role: (['user', 'admin'].includes(userRole) ? userRole : 'guest') as
      | 'guest'
      | 'user'
      | 'admin',
  };

  next();
}
