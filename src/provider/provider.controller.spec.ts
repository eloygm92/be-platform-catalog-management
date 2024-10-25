import { Test, TestingModule } from '@nestjs/testing';
import { ProviderController } from './provider.controller';
import { ProviderService } from './provider.service';
import { ProviderServiceMock } from "./provider-service-mock";
import { AdminUseGuard } from "../auth/guards/adminUse.guard";
import { Provider } from "./entities/provider.entity";

describe('ProviderController', () => {
  let controller: ProviderController;
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

  const mockProviderDto = {
    id: 1,
    name: 'ProviderTest 1',
    external_id: 10,
    logo_path: 'logo_path',
    type: 'tv',
  }

  beforeEach(async () => {
    const ProviderServiceProvider = {
      provide: ProviderService,
      useClass: ProviderServiceMock,
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [ProviderController],
      providers: [ProviderService, ProviderServiceProvider],
    })
      .overrideGuard(AdminUseGuard)
      .useValue('')
      .overrideProvider(ProviderService)
      .useClass(ProviderServiceMock)
      .compile();

    controller = module.get<ProviderController>(ProviderController);
    service = module.get<ProviderService>(ProviderService);
  });

  it('should be findAll', async () => {
    expect(await controller.findAll({page: 0, limit: 10, offset: 0, size: 1})).toEqual([mockProvider]);
  });

  it('should be findAllSelect', async () => {
    expect(await controller.findAllSelect()).toEqual([mockProvider]);
  });

  it('should be findOne', async () => {
    expect(await controller.findOne(1)).toEqual(mockProvider);
  });

  it('should be find providers by watchable id', async () => {
    expect(await controller.findProvidersByWatchableId(1)).toEqual([mockProvider]);
  });

  it('should be create a provider', async () => {
    expect(await controller.create(mockProviderDto)).toEqual({
      id: expect.any(Number),
      ...mockProvider,
    });
  });

  it('should be update a provider', async () => {
    expect(await controller.update(1, mockProvider)).toEqual({
      id: 1,
      ...mockProvider,
    });
  });

  it('should be remove a provider', async () => {
    expect(await controller.remove('1')).toEqual(mockProvider);
  });
});
