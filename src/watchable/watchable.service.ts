import { Injectable } from '@nestjs/common';
import { CreateWatchableDto } from './dto/create-watchable.dto';
import { UpdateWatchableDto } from './dto/update-watchable.dto';
import { Watchable } from './entities/watchable.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Provider } from '../provider/entities/provider.entity';
import { Filtering } from "../helpers/decorators/filtering-params.decorator";
import { Pagination } from "../helpers/decorators/params-params.decorator";
import { Sorting } from "../helpers/decorators/sorting-params.decorator";
import { getOrder, getWhere } from "../helpers/typeOrm.helper";
import { PaginatedResource } from "../helpers/paginatedResource.type";

@Injectable()
export class WatchableService {
  constructor(
    @InjectRepository(Watchable)
    private watchableRepository: Repository<Watchable>,
    @InjectRepository(Provider)
    private providerRepository: Repository<Provider>,
  ) {}
  async create(createWatchableDto: CreateWatchableDto) {
    const { providers, ...createWatchableDataDto } = createWatchableDto;
    const watchable = this.watchableRepository.create(createWatchableDataDto);
    await this.watchableRepository.save(watchable);

    if (!providers) return watchable;
    try {
      return await this.saveProviders(watchable, providers);
    } catch (e) {
      await this.watchableRepository.delete(watchable.id);
      return e;
    }
  }

  async findAll(
    { page, limit, size, offset }: Pagination,
    sort?: Sorting,
    filter?: Filtering[],
  ): Promise<PaginatedResource<Partial<Watchable>>> {
    const where = getWhere(filter);
    const order = getOrder(sort);

    const [watchables, total] = await this.watchableRepository.findAndCount({
      where,
      order,
      take: limit,
      skip: offset,
    });

    return {
      totalItems: total,
      items: watchables,
      page,
      size
    };
  }

  async findOne(id: number) {
    return await this.watchableRepository.findOneBy({ id });
  }

  async update(id: number, updateWatchableDto: UpdateWatchableDto) {
    const { providers, ...updateWatchableDataDto } = updateWatchableDto;
    const updated = await this.watchableRepository.update(
      id,
      updateWatchableDataDto,
    );
    if (!providers) return updated.affected === 1 ? this.findOne(id) : false;

    try {
      const updatedWatchable = await this.findOne(id);
      return await this.saveProviders(updatedWatchable, providers);
    } catch (e) {
      return e;
    }
  }

  async remove(id: number) {
    const providersAux = await this.providerRepository.find({
      relations: ['watchables'],
      where: { watchables: { id } },
    });
    const providersData = await this.getProvidersWithWatchable(
      providersAux.reduce((acc, provider) => {
        acc.push(provider.id);
        return acc;
      }, []),
    );

    providersData.forEach(
      (provider) =>
        (provider.watchables = provider.watchables.filter(
          (watchable) => watchable.id !== id,
        )),
    );

    await this.providerRepository.save(providersData);
    const removed = await this.watchableRepository.delete(id);
    return removed.affected === 1;
  }

  private async saveProviders(watchable: Watchable, providers: number[]) {
    const providersWithWatchables =
      await this.getProvidersWithWatchable(providers);

    for await (const provider of providersWithWatchables) {
      if (!provider.watchables) provider.watchables = [watchable];
      else {
        const setData = new Set(provider.watchables);
        setData.add(watchable);
        provider.watchables = Array.from(setData);
      }
    }

    return await this.providerRepository.save(providersWithWatchables);
  }

  private async getProvidersWithWatchable(providers: number[]) {
    return await this.providerRepository
      .createQueryBuilder('Provider')
      .where('Provider.id IN (:ids)', { ids: providers })
      .leftJoinAndSelect('Provider.watchables', 'watchables')
      .getMany();
  }
}
