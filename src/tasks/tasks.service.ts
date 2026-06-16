import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Task, TaskStatus } from './entities/task.entity';
import { Repository } from 'typeorm';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';

@Injectable()
export class TasksService {
  constructor(
    @InjectRepository(Task)
    private readonly taskRepo: Repository<Task>,
  ) {}

  async create(createTaskDto: CreateTaskDto) {
    const task = this.taskRepo.create(createTaskDto);
    return await this.taskRepo.save(task);
  }

  async findAll(status?: TaskStatus) {
    return await this.taskRepo.find({
      where: status ? { status } : {},
    });
  }

  async findOne(id: string) {
    const task = await this.taskRepo.findOneBy({ id });
    if (!task) {
      throw new NotFoundException(`Task with ${id} not found`);
    }

    return task;
  }

  async update(id: string, updateTaskDto: UpdateTaskDto) {
    const task = await this.taskRepo.preload({ id, ...updateTaskDto });

    if (!task) throw new NotFoundException(`Task with ${id} not found`);
    return this.taskRepo.save(task);
  }

  async remove(id: string) {
    const task = await this.findOne(id);
    await this.taskRepo.remove(task);
    return `Task with id ${id} removed`;
  }
}
