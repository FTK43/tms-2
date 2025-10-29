import { DynamicModule, forwardRef, Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { TasksModule } from '../tasks/tasks.module';
import { AuthCoreModule } from './auth.core.module';

export const AUTH_OPTIONS = 'AUTH_OPTIONS';

export interface AuthModuleOptions {
  secret: string;
  tokenPrefix?: string;
}

@Module({})
export class AuthModule {
  static forRoot(options: AuthModuleOptions): DynamicModule {
    return {
      module: AuthModule,
      imports: [forwardRef(() => TasksModule), AuthCoreModule],
      providers: [
        AuthService,
        {
          provide: AUTH_OPTIONS,
          useValue: options,
        },
      ],
      exports: [AuthCoreModule],
    };
  }
}
