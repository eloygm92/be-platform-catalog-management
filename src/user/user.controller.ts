import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { Pagination, PaginationParams } from "../helpers/decorators/params-params.decorator";
import { Sorting, SortingParams } from "../helpers/decorators/sorting-params.decorator";
import { Filtering, FilteringParams } from "../helpers/decorators/filtering-params.decorator";

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  /*@Post()
  create(@Body() createUserDto: CreateUserDto) {
    return this.userService.create(createUserDto);
  }*/

  @Get()
  findAll(
    @PaginationParams() paginationParams: Pagination,
    @SortingParams(['id', 'username', 'email', 'role.name']) sort?: Sorting,
    @FilteringParams(['id', 'username', 'email', 'role.name']) filter?: Filtering[],
  ) {
    return this.userService.findAll(paginationParams, sort, filter);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.userService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: number, @Body() updateUserDto: UpdateUserDto) {
    return this.userService.update(+id, updateUserDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.userService.remove(+id);
  }
}
