import { Test, TestingModule } from '@nestjs/testing';
import { UserService } from './user.service';
import { UserRepositoryMock } from "./user-repository-mock";
import { User } from "./entities/user.entity";
import { Role } from "./entities/role.entity";
import { RoleRepositoryMock } from "./role-repository-mock";
import { Provider } from "../provider/entities/provider.entity";
import { CreateUserDto } from "./dto/create-user.dto";

describe('UserService', () => {
  let service: UserService;
  const mockRole: Role = {
    id: 1,
    name: 'admin',
    users: [],
  };

  const mockUser: User = {
    id: 1,
    username: 'John Doe',
    email: 'johndoe@email.com',
    password: undefined,
    refresh_token: '123456',
    role: mockRole,
    created_at: new Date('2021-10-10T00:00:00.000Z'),
    updated_at: new Date('2021-10-10T00:00:00.000Z'),
    deactivate_at: new Date('2021-10-10T00:00:00.000Z'),
    watchlists: [],
    providers: [],
    avatar_img: '',
  };

  const mockCreateUserDto: {role: string} | CreateUserDto = {
    id: 1,
    username: 'John Doe',
    email: 'johndoe@email.com',
    password: undefined,
    role: mockRole,
    avatar_img: '',
    providers: [],
  }

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        {
          provide: 'UserRepository',
          useClass: UserRepositoryMock,
        },
        {
          provide: 'RoleRepository',
          useClass: RoleRepositoryMock
        }
      ],
    }).compile();

    service = module.get<UserService>(UserService);
  });

  it('should be return all', async () => {
    expect(await service.findAll({page: 0, limit: 10, offset: 0, size: 1})).toEqual({items: [mockUser], page: 1, size: 1, totalItems: 1});
  });

  it('should be return one', async () => {
    expect(await service.findOne(1)).toEqual(mockUser);
  });

  it('should return all roles', async () => {
    expect(await service.findAllRoles()).toEqual([mockRole]);
  })

  it('should be deactivate a user', async () => {
    expect(await service.deactivate(1)).toEqual(mockUser);
  });

  it('should be a restore a user', async () => {
    expect(await service.restore(1)).toEqual(mockUser);
  });

  it('should be update a user', async () => {
    mockCreateUserDto.id = 1;
    const resultUser: {id: number, username: string, email: string, password?: string, role: Role | string, providers: Provider[], avatar_img: string} = Object.assign({}, mockCreateUserDto);
    resultUser.role = 'admin';
    expect(await service.update(1, mockCreateUserDto)).toEqual(resultUser);
  });
});
