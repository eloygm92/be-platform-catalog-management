import { Test, TestingModule } from '@nestjs/testing';
import { ProviderService } from './provider.service';
import { ProviderRepositoryMock } from "./provider-repository-mock";
import { Provider } from "./entities/provider.entity";
import { CreateProviderDto } from "./dto/create-provider.dto";

describe('ProviderService', () => {
  let service: ProviderService;
  const mockProvider: Provider = {
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

  const mockProviderDto: CreateProviderDto = {
    id: 1,
    name: 'ProviderTest 1',
    external_id: 10,
    logo_path: 'logo_path',
    type: 'tv',
  }

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ProviderService,
        {
          provide: 'ProviderRepository',
          useClass: ProviderRepositoryMock,
        }
      ],
    }).compile();

    service = module.get<ProviderService>(ProviderService);
  });

  it('should be findAll', async () => {
    expect(await service.findAll({page: 0, limit: 10, offset: 0, size: 1})).toEqual({items: [mockProvider], page: 1, size: 1, totalItems: 1});
    expect(await service.findAllSelect()).toEqual([mockProvider]);
  });

  it('should be findOne', async () => {
    expect(await service.findOne(1)).toEqual(mockProvider);
    expect(await service.findProvidersByWatchableId(1)).toEqual([mockProvider]);
  });

  it('should be create a provider', async () => {
    expect(await service.create(mockProviderDto)).toEqual({
      id: expect.any(Number),
      type: 'tv',
      ...mockProvider,
    });
  })

  it('should be update a provider', async () => {
    expect(await service.update(1, mockProvider)).toEqual({
      id: 1,
      ...mockProvider,
    });
  });

  it('should be remove a provider', async () => {
    expect(await service.remove(1)).toEqual(true);
  });
});
