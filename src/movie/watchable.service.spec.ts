import { Test, TestingModule } from '@nestjs/testing';
import { WatchableService } from './watchable.service';

describe('MovieService', () => {
  let service: WatchableService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [WatchableService],
    }).compile();

    service = module.get<WatchableService>(WatchableService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
