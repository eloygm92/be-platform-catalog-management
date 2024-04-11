import {
  Controller,
  Get,
  Body,
  Patch,
  Param,
  Delete, UseGuards
} from "@nestjs/common";
import { UserService } from './user.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { Pagination, PaginationParams } from "../helpers/decorators/params-params.decorator";
import { Sorting, SortingParams } from "../helpers/decorators/sorting-params.decorator";
import { Filtering, FilteringParams } from "../helpers/decorators/filtering-params.decorator";
import { AdminUseGuard } from "../auth/guards/adminUse.guard";

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

  @Get('roles')
  findAllRoles() {
    return this.userService.findAllRoles();
  }

  @UseGuards(AdminUseGuard)
  @Get('deactivate/:id')
  deactivate(@Param('id') id: number) {
    return this.userService.deactivate(id);
  }

  @UseGuards(AdminUseGuard)
  @Get('restore/:id')
  restore(@Param('id') id: number) {
    return this.userService.restore(id);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.userService.findOne(+id);
  }

  @UseGuards(AdminUseGuard)
  @Patch(':id')
  update(@Param('id') id: number, @Body() updateUserDto: UpdateUserDto) {
    return this.userService.update(+id, updateUserDto);
  }

  @UseGuards(AdminUseGuard)
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.userService.remove(+id);
  }
}
