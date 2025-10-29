import {
  Injectable,
  NestMiddleware,
  UnauthorizedException,
} from '@nestjs/common';
import { NextFunction, Request, Response } from 'express';

const DEFAULT_TOKEN = 'dev-token';

@Injectable()
export class AuthTokenMiddleware implements NestMiddleware {
  private readonly expectedToken = process.env.API_TOKEN ?? DEFAULT_TOKEN;

  use(req: Request, _res: Response, next: NextFunction) {
    const headerValue = req.header('authorization');
    const token = this.extractToken(headerValue);

    if (token !== this.expectedToken) {
      throw new UnauthorizedException('Invalid or missing bearer token');
    }

    next();
  }

  private extractToken(headerValue?: string): string | null {
    if (!headerValue) {
      return null;
    }

    const match = headerValue.match(/^Bearer\s+(.+)$/i);
    if (!match) {
      return null;
    }

    return match[1].trim();
  }
}
