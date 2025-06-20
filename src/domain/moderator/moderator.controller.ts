import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ParseIntPipe,
} from '@nestjs/common';
import { ModeratorService } from './moderator.service';
import { Prisma } from '@prisma/client';

@Controller('moderators')
export class ModeratorController {
  constructor(private readonly moderatorService: ModeratorService) {}

  @Post()
  create(@Body() createModeratorDto: Prisma.ModeratorCreateInput) {
    return this.moderatorService.create(createModeratorDto);
  }

  @Get()
  findAll() {
    return this.moderatorService.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.moderatorService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateModeratorDto: Prisma.ModeratorUpdateInput,
  ) {
    return this.moderatorService.update(id, updateModeratorDto);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.moderatorService.remove(id);
  }
}
