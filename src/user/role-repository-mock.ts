import { Role } from "./entities/role.entity";

export class RoleRepositoryMock {
  mockRole: Role = {
    id: 1,
    name: 'admin',
    users: [],
  };

  async findOneBy(filter: any): Promise<Role> {
    return Promise.resolve(this.mockRole);
  }

  async find(): Promise<Role[]> {
    return Promise.resolve([this.mockRole]);
  }
}
