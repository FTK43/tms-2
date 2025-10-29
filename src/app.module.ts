import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TasksModule } from './tasks/tasks.module';
import { LoggerMiddleware } from './common/logger.middleware';
import { AuthTokenMiddleware } from './common/auth-token.middleware';
import { AuthModule } from './auth/auth.module';

@Module({
  imports: [
    TasksModule,
    AuthModule.forRoot({
      secret: 'super-secret-key',
      tokenPrefix: 'Bearer',
    }),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(LoggerMiddleware /*, AuthTokenMiddleware*/).forRoutes('*');
  }
}
