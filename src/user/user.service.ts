import { BadRequestException, Injectable } from "@nestjs/common";
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from './entities/user.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Pagination } from "../helpers/decorators/params-params.decorator";
import { Sorting } from "../helpers/decorators/sorting-params.decorator";
import { Filtering } from "../helpers/decorators/filtering-params.decorator";
import { PaginatedResource } from "../helpers/paginatedResource.type";
import { Watchable } from "../watchable/entities/watchable.entity";
import { getOrder, getWhere } from "../helpers/typeOrm.helper";
import { Role } from "./entities/role.entity";
import * as bcrypt from 'bcrypt';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Role)
    private roleRepository: Repository<Role>,
  ) {}

  /*create(createUserDto: CreateUserDto) {
    return 'This action adds a new user';
  }*/

  async findAll(
    { page, limit, size, offset }: Pagination,
    sort?: Sorting,
    filter?: Filtering[],
  ): Promise<PaginatedResource<Partial<Watchable>>> {
    const where = getWhere(filter);
    const order = getOrder(sort);

    const [watchables, total] = await this.userRepository.findAndCount({
      select: ['id', 'username', 'email', 'created_at', 'updated_at', 'deactivate_at', 'role'],
      relations: ['role'],
      where,
      order,
      take: limit,
      skip: offset,
    });

    return {
      totalItems: total,
      items: watchables,
      page: (page + 1),
      size: size
    };
  }

  async findOne(id: number) {
    return await this.userRepository.findOne({ relations: ['role'], where: { id: id } });
  }

  async update(id: number, updateUserDto: UpdateUserDto) {
    const { role, ...updateUserDtoData } = updateUserDto;

    const roleExist = await this.roleRepository.findOneBy({ name: role.name });

    if (!roleExist)
      throw new BadRequestException('Role does not exist');

    updateUserDto.role = roleExist;

    if (updateUserDtoData.password)
      updateUserDtoData.password = await bcrypt.hash(updateUserDtoData.password, process.env.SALT);

    const update = await this.userRepository.update(id, { ...updateUserDtoData, role: role });
    return update;
  }

  remove(id: number) {
    return `This action removes a #${id} user`;
  }
}
