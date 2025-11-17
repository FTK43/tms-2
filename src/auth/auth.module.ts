import { DynamicModule, Global, Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AUTH_OPTIONS, AuthModuleOptions } from './auth.constants';

@Global()
@Module({
  providers: [AuthService],
  exports: [AuthService],
})
export class AuthModule {
  static forRoot(options: AuthModuleOptions): DynamicModule {
    return {
      module: AuthModule,
      providers: [
        {
          provide: AUTH_OPTIONS,
          useValue: options,
        },
      ],
      exports: [AuthService],
    };
  }
}
