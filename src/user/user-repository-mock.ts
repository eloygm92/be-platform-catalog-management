import { User } from "./entities/user.entity";
import { Role } from "./entities/role.entity";

export class UserRepositoryMock {
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

  async findAndCount(): Promise<[User[], number]> {
    return Promise.resolve([[this.mockUser], 1]);
  }

  async findOne(id: number | { relations: string[], where: {id: number} }): Promise<User> {
    this.mockUser.id = typeof id === 'object' ? id.where.id : id;
    const userMock = Object.assign({}, this.mockUser);
    return Promise.resolve(userMock);
  }

  async save(user: User): Promise<User> {
    return Promise.resolve(this.mockUser);
  }
}
