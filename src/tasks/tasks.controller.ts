import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  HttpCode,
  UseInterceptors,
  Query,
  ParseIntPipe,
  DefaultValuePipe,
  UseGuards,
  UsePipes,
  BadRequestException,
  UploadedFile,
} from '@nestjs/common';
import { TasksService } from './tasks.service';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { CacheInterceptor } from '@nestjs/cache-manager';
import { CompleteManyDto } from './dto/complete-many.dto';
import { CurrentUser } from '../common/current-user.decorator';
import { ApiKeyGuard } from '../common/guards/api-key.guard';
import { TaskOwnerOrAdminGuard } from '../common/guards/task-owner-or-admin.guard';
import { NormalizeTaskPipe } from '../common/pipes/normalize-task.pipe';
import { TaskStatusValidationPipe } from '../common/pipes/task-status-validation.pipe';
import { TaskStatus } from '../common/task-status.enum';
import { LoggerInterceptor } from '../common/interceptors/logger.interceptor';
import { ResponseTransformInterceptor } from '../common/interceptors/response-transform.interceptor';
import { FileStorageService } from '../file-storage/file-storage.service';
import { FileInterceptor } from '@nestjs/platform-express';

@Controller('tasks')
@UseInterceptors(
  // CacheInterceptor,
  LoggerInterceptor,
  ResponseTransformInterceptor,
)
export class TasksController {
  constructor(
    private readonly tasks: TasksService,
    private readonly fileStorage: FileStorageService,
  ) {}

  @Get('whoami')
  async getUser(@CurrentUser() user) {
    return user ?? { message: 'no user' };
  }

  @Get()
  async findAll(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number,
    @Query('status', TaskStatusValidationPipe) status?: TaskStatus,
  ) {
    const all = await this.tasks.findAll();
    const start = (page - 1) * limit;
    const data = all.slice(start, start + limit);

    return {
      data,
      meta: {
        page,
        limit,
        total: all.length,
      },
    };
  }

  @Get(':id')
  async findOne(@Param('id', new ParseUUIDPipe()) id: string) {
    const task = await this.tasks.findOne(id);

    return task;
  }

  @Post()
  @HttpCode(201)
  @UsePipes(NormalizeTaskPipe)
  create(@Body() dto: CreateTaskDto) {
    return this.tasks.create(dto);
  }

  @Delete(':id')
  @UseGuards(ApiKeyGuard)
  @HttpCode(204)
  async remove(@Param('id', new ParseUUIDPipe()) id: string) {
    await this.tasks.remove(id);
  }

  @Patch(':id/complete')
  complete(@Param('id', new ParseUUIDPipe()) id: string) {
    return this.tasks.complete(id);
  }

  @Patch('complete')
  completeMany(@Body() dto: CompleteManyDto) {
    return this.tasks.completeMany(dto.ids);
  }

  @Patch(':id')
  @UseGuards(TaskOwnerOrAdminGuard)
  update(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() dto: UpdateTaskDto,
  ) {
    return this.tasks.update(id, dto);
  }

  @Post('import-csv')
  @UseInterceptors(
    FileInterceptor('file', {
      limits: { fileSize: 10 * 1024 * 1024 },
      fileFilter: (_req, file, cb) => {
        const ok =
          file.mimetype === 'text/csv' ||
          file.mimetype === 'application/vnd.ms-excel';

        if (!ok) {
          return cb(
            new BadRequestException('Only CSV file are allowed'),
            false,
          );
        }
        cb(null, true);
      },
    }),
  )
  async importCsv(@UploadedFile() file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('File is required');
    }

    return this.fileStorage.saveToLocal(file, 'csv');
  }
}
