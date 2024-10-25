import { Provider } from "./entities/provider.entity";
import { CreateProviderDto } from "./dto/create-provider.dto";

export class ProviderServiceMock {
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

  mockProviderDto = {
    id: 1,
    name: 'ProviderTest 1',
    external_id: 10,
    logo_path: 'logo_path',
    type: 'tv',
  }

  async create(createProviderDto: CreateProviderDto): Promise<Provider> {
    return Promise.resolve({
      id: Math.random() * (1000 - 1) + 1,
      ...this.mockProvider,
    });
  }

  async findAll(): Promise<Provider[]> {
    return Promise.resolve([this.mockProvider]);
  }

  async findAllSelect(): Promise<Provider[]> {
    return Promise.resolve([this.mockProvider]);
  }

  async findOne(id: number | {id: number}): Promise<Provider> {
    this.mockProvider.id = typeof id === 'object' ? id.id : id;
    return Promise.resolve(this.mockProvider);
  }

  async findProvidersByWatchableId(id: number): Promise<Provider[]> {
    return Promise.resolve([this.mockProvider]);
  }

  async update(id, updateProviderDto): Promise<any> {
    this.mockProvider.id = id;
    return Promise.resolve(this.mockProvider);
  }

  async remove(id: number): Promise<any> {
    this.mockProvider.id = id;
    return Promise.resolve(this.mockProvider);
  }
}
