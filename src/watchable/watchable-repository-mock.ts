import { CreateWatchableDto } from "./dto/create-watchable.dto";
import { Watchable } from "./entities/watchable.entity";

export class WatchableRepositoryMock {
  mockWatchable: Watchable = {
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
  };

  async create(createWatchableDto: CreateWatchableDto) {
    return Promise.resolve(this.mockWatchable);
  }

  async save(watchable: Watchable) {
    return Promise.resolve(watchable);
  }

  async delete(id: number) {
    return Promise.resolve({ affected: 1 });
  }

  async getManyAndCount() {
    return Promise.resolve([[this.mockWatchable], 1]);
  }

  async findOne(id: number) {
    return Promise.resolve(this.mockWatchable);
  }

  async find() {
    return Promise.resolve([this.mockWatchable]);
  }

  async update(id: number, updateWatchableDto: CreateWatchableDto) {
    return Promise.resolve(this.mockWatchable);
  }

  async createQueryBuilder() {
    return this;
  }

  async innerJoin(s1: string, s2: string) {
    return this;
  }

  async orderBy() {
    return this;
  }

  async skip() {
    return this;
  }

  async take() {
    return this;
  }

  async where() {
    return this;
  }
}
