import {
  Controller,
  Get,
  Post,
  Body,
  Query,
  Patch,
  Param,
  Delete,
  ParseIntPipe,
} from '@nestjs/common';
import { BookService, PaginatedBooks } from './book.service';
import { CreateBookDto } from './dtos/create-book.dto';
import { UpdateBookDto } from './dtos/update-book.dto';
import { Book } from '@prisma/client';

@Controller('books')
export class BookController {
  constructor(private readonly bookService: BookService) {}

  /**
   * POST /books
   * Cria um novo Book com todos os campos obrigatórios do CreateBookDto.
   */
  @Post()
  async create(@Body() createBookDto: CreateBookDto): Promise<Book> {
    return this.bookService.create(createBookDto);
  }

  /**
   * GET /books
   * Retorna lista de TODOS os livros, incluindo owner, authorizer e exchanges.
   */
  @Get()
  async findAll(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ): Promise<PaginatedBooks> {
    const pageNumber = page ? parseInt(page, 10) : 1;
    const limitNumber = limit ? parseInt(limit, 10) : 10;
    console.log(pageNumber, limitNumber);
    return this.bookService.findAllWithPagination(pageNumber, limitNumber, true);
  }

  /**
   * GET /books/:id
   * Retorna um único livro por id (ParseIntPipe garante que id é número).
   */
  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number): Promise<Book> {
    return this.bookService.findOne(id);
  }

  /**
   * PATCH /books/:id
   * Atualiza campos parciais de um Book existente.
   */
  @Patch(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateBookDto: UpdateBookDto,
  ): Promise<Book> {
    return this.bookService.update(id, updateBookDto);
  }

  /**
   * DELETE /books/:id
   * Remove um Book por id.
   */
  @Delete(':id')
  async remove(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return this.bookService.remove(id);
  }

  /**
   * GET /books/user/:userId
   * Retorna lista paginada de livros de um usuário específico
   */
  @Get('user/:userId')
  async findByUser(
    @Param('userId', ParseIntPipe) userId: number,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ): Promise<PaginatedBooks> {
    const pageNumber = page ? parseInt(page, 10) : 1;
    const limitNumber = limit ? parseInt(limit, 10) : 10;
    return this.bookService.findByUser(userId, pageNumber, limitNumber);
  }
}
