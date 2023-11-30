import { Test, TestingModule } from '@nestjs/testing';
import { WatchableController } from './watchable.controller';
import { WatchableService } from './watchable.service';

describe('MovieController', () => {
  let controller: WatchableController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [WatchableController],
      providers: [WatchableService],
    }).compile();

    controller = module.get<WatchableController>(WatchableController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
