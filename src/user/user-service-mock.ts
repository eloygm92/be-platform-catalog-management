import { User } from "./entities/user.entity";
import { Role } from "./entities/role.entity";
import { Pagination } from "../helpers/decorators/params-params.decorator";
import { Sorting } from "../helpers/decorators/sorting-params.decorator";
import { Filtering } from "../helpers/decorators/filtering-params.decorator";

export class UserServiceMock {
  mockRole: Role = {
    id: 1,
    name: 'admin',
    users: [],
  };

  mockUser: User = {
    id: 1,
    username: 'John Doe',
    email: 'johndoe@email.com',
    password: undefined,
    refresh_token: '123456',
    role: this.mockRole,
    created_at: new Date('2021-10-10T00:00:00.000Z'),
    updated_at: new Date('2021-10-10T00:00:00.000Z'),
    deactivate_at: new Date('2021-10-10T00:00:00.000Z'),
    watchlists: [],
    providers: [],
    avatar_img: '',
  };

  async findAll(pagination: Pagination, sort?: Sorting, filter?: Filtering[]): Promise<{items: User[], page: number, size: number, totalItems: number}> {
    return Promise.resolve({items:[this.mockUser], page: 0, size: 1, totalItems: 1});
  }

  async findOne(id: number): Promise<User> {
    return Promise.resolve(this.mockUser);
  }

  async findAllRoles(): Promise<Role[]> {
    return Promise.resolve([this.mockRole]);
  }

  async update(id: number, updateUserDto: any): Promise<User> {
    return Promise.resolve(this.mockUser);
  }

  async deactivate(id: number): Promise<User> {
    return Promise.resolve(this.mockUser);
  }

  async restore(id: number): Promise<User> {
    return Promise.resolve(this.mockUser);
  }
}
