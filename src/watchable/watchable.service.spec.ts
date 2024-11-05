import { Test, TestingModule } from '@nestjs/testing';
import { WatchableService } from './watchable.service';
import { ProviderRepositoryMock } from "../provider/provider-repository-mock";
import { WatchableRepositoryMock } from "./watchable-repository-mock";
import { GenreRepositoryMock } from "./genre-repository-mock";
import { Watchable } from "./entities/watchable.entity";

describe('MovieService', () => {
  let service: WatchableService;
  let mockWatchable: Watchable = {
    id: 1,
    name: 'Test',
    original_name: 'Test',
    external_id: 1,
    overview: 'Test',
    vote_average: 1,
    vote_count: 1,
    popularity: 1,
    type: 'movie',
    release_date: new Date('2021-01-01'),
    poster_path: 'Test',
    backdrop_path: 'Test',
    tagline: 'Test',
    genres: [],
    created_at: new Date('2021-10-10T00:00:00.000Z'),
    updated_at: new Date('2021-10-10T00:00:00.000Z'),
    deactivate_at: undefined,
    control: true,
    provider: [],
    seasons: [],
    watchlists: [],
  }

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        WatchableService,
        {
          provide: 'WatchableRepository',
          useClass: WatchableRepositoryMock,
        },
        {
          provide: 'ProviderRepository',
          useClass: ProviderRepositoryMock,
        },
        {
          provide: 'GenreRepository',
          useClass: GenreRepositoryMock,
        }
      ],
    }).compile();

    service = module.get<WatchableService>(WatchableService);
  });

  it('should be return a list of Watchables', async () => {
    expect(await service.findAll({ page: 0, limit: 1, size: 1, offset: 0 })).toEqual({items:[mockWatchable], page: 0, size: 1, totalItems: 1});
  });
});
