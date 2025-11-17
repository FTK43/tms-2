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
} from '@nestjs/common';
import { TasksService } from './tasks.service';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { CacheInterceptor } from '@nestjs/cache-manager';
import { CompleteManyDto } from './dto/complete-many.dto';

@Controller('tasks')
export class TasksController {
  constructor(private readonly tasks: TasksService) {}

  @Get()
  @UseInterceptors(CacheInterceptor)
  async findAll(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number,
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
  @UseInterceptors(CacheInterceptor)
  async findOne(@Param('id', new ParseUUIDPipe()) id: string) {
    const task = await this.tasks.findOne(id);

    return task;
  }

  @Post()
  @HttpCode(201)
  create(@Body() dto: CreateTaskDto) {
    return this.tasks.create(dto);
  }

  @Delete(':id')
  @HttpCode(204)
  remove(@Param('id', new ParseUUIDPipe()) id: string) {
    this.tasks.remove(id);
  }

  // @Patch(':id/complete')
  // complete(@Param('id', new ParseUUIDPipe()) id: string) {
  //   return this.tasks.complete(id);
  // }

  @Patch('complete')
  completeMany() {
    const ids = [
      '01648282-e123-4828-9226-0abef1225ede',
      '6ea0e3ad-cfa8-451c-85c5-f71e988dd8d4',
      '8f619fff-9ba6-4c10-923b-1a671ea9584e',
    ];

    return this.tasks.completeMany(ids);
  }

  @Patch(':id')
  update(
    @Param('id' /*, new ParseUUIDPipe()*/) id: string,
    @Body() dto: UpdateTaskDto,
  ) {
    return this.tasks.update(id, dto);
  }
}
