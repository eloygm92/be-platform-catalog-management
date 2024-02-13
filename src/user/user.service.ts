import { BadRequestException, Injectable } from '@nestjs/common';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from './entities/user.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Pagination } from '../helpers/decorators/params-params.decorator';
import { Sorting } from '../helpers/decorators/sorting-params.decorator';
import { Filtering } from '../helpers/decorators/filtering-params.decorator';
import { PaginatedResource } from '../helpers/paginatedResource.type';
import { Watchable } from '../watchable/entities/watchable.entity';
import { getOrder, getWhere } from '../helpers/typeOrm.helper';
import { Role } from './entities/role.entity';
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
      select: [
        'id',
        'username',
        'email',
        'created_at',
        'updated_at',
        'deactivate_at',
        'role',
      ],
      relations: ['role'],
      where,
      order,
      take: limit,
      skip: offset,
    });

    return {
      totalItems: total,
      items: watchables,
      page: page + 1,
      size: size,
    };
  }

  async findOne(id: number) {
    return await this.userRepository.findOne({
      relations: ['role', 'providers'],
      where: { id: id },
    });
  }

  async update(id: number, updateUserDto: UpdateUserDto) {
    const { role, ...updateUserDtoData } = updateUserDto;
    const userStored = await this.userRepository.findOne({
      relations: ['role', 'providers'],
      where: { id: id },
    });
    if (role) {
      const roleExist = await this.roleRepository.findOneBy({
        name: role.name,
      });

      if (!roleExist) throw new BadRequestException('Role does not exist');

      updateUserDto.role = roleExist;
    }

    if (updateUserDtoData.password)
      updateUserDto.password = await bcrypt.hash(
        updateUserDto.password,
        process.env.SALT,
      );

    const userToSave = Object.assign(userStored, { ...updateUserDto });

    //return await this.userRepository.update(id, { ...updateUserDto, role: role });
    return await this.userRepository.save(userToSave);
  }

  remove(id: number) {
    return `This action removes a #${id} user`;
  }

  async findAllRoles() {
    return await this.roleRepository.find();
  }

  async deactivate(id: number) {
    const user = await this.userRepository.findOne({ where: { id: id } });
    user.deactivate_at = new Date();
    return await this.userRepository.save(user);
  }

  async restore(id: number) {
    const user = await this.userRepository.findOne({ where: { id: id } });
    user.deactivate_at = null;
    return await this.userRepository.save(user);
  }
}
