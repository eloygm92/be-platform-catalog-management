import { Test, TestingModule } from '@nestjs/testing';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { AdminUseGuard } from "../auth/guards/adminUse.guard";
import { User } from "./entities/user.entity";
import { Role } from "./entities/role.entity";
import { UserServiceMock } from "./user-service-mock";

describe('UserController', () => {
  let controller: UserController;
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

  beforeEach(async () => {
    const UserServiceProvider = {
      provide: UserService,
      useClass: UserServiceMock,
    }
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UserController],
      providers: [UserService, UserServiceProvider],
    })
      .overrideGuard(AdminUseGuard)
      .useValue('')
      .overrideProvider(UserService)
      .useClass(UserServiceMock)
      .compile();

    controller = module.get<UserController>(UserController);
    service = module.get<UserService>(UserService);
  });

  it('should be return all', async () => {
    const spy = jest.spyOn(service, 'findAll');
    expect(await controller.findAll({page: 0, limit: 10, offset: 0, size: 1})).toEqual({items: [mockUser], page: 0, size: 1, totalItems: 1});
    expect(spy).toHaveBeenCalled();
  });

  it('should be return one', async () => {
    const spy = jest.spyOn(service, 'findOne');
    expect(await controller.findOne('1')).toEqual(mockUser);
    expect(spy).toHaveBeenCalledWith(1);
  })

  it('should return all roles', async () => {
    expect(await controller.findAllRoles()).toEqual([mockRole]);
  })

  it('should be deactivate a user', async () => {
    expect(await controller.deactivate(1)).toEqual(mockUser);
  })

  it('should be restore a user', async () => {
    expect(await controller.restore(1)).toEqual(mockUser);
  })

  it('should be update a user', async () => {
    expect(await controller.update(1, mockUser)).toEqual(mockUser);
  })

  it('should be remove a user', async () => {
    expect(await controller.remove('1')).toEqual(mockUser);
  })
});
