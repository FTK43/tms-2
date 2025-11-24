import { Injectable, PipeTransform } from '@nestjs/common';
import { CreateTaskDto } from '../../tasks/dto/create-task.dto';

@Injectable()
export class NormalizeTaskPipe implements PipeTransform {
  transform(dto: CreateTaskDto) {
    if (dto.title) {
      const normalized = dto.title.trim().replace(/s+/g, ' ');
      dto.title = normalized[0].toUpperCase() + normalized.slice(1);
    }

    return dto;
  }
}
