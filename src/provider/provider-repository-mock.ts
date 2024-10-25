import { Provider } from "./entities/provider.entity";
import { CreateProviderDto } from "./dto/create-provider.dto";

export class ProviderRepositoryMock {
  mockProvider: Provider = {
    id: 1,
    name: 'ProviderTest 1',
    external_id: 10,
    logo_path: 'logo_path',
    created_at: new Date('2021-10-10T00:00:00.000Z'),
    updated_at: new Date('2021-10-10T00:00:00.000Z'),
    deleted_at: new Date('2021-10-10T00:00:00.000Z'),
    watchables: [],
    users: [],
  };

  async create(createProviderDto: CreateProviderDto): Promise<Provider> {
    return Promise.resolve({
      id: Math.random() * (1000 - 1) + 1,
      type: 'tv',
      ...this.mockProvider,
    });
  }

  async save(provider: Provider): Promise<Provider> {
    return Promise.resolve(provider);
  }

  async findAndCount(): Promise<[Provider[], number]> {
    return Promise.resolve([[this.mockProvider], 1]);
  }

  async find(): Promise<Provider[]> {
    return Promise.resolve([this.mockProvider]);
  }

  async findOneBy(id: number | {id: number}): Promise<Provider> {
    this.mockProvider.id = typeof id === 'object' ? id.id : id;
    return Promise.resolve(this.mockProvider);
  }

  async update(id, updateProviderDto): Promise<any> {
    return Promise.resolve({
      raw: [],
      affected: 1,
    });
  }
}
