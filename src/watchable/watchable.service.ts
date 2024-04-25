import { Injectable } from '@nestjs/common';
import { CreateWatchableDto } from './dto/create-watchable.dto';
import { UpdateWatchableDto } from './dto/update-watchable.dto';
import { Watchable } from './entities/watchable.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from "typeorm";
import { Provider } from '../provider/entities/provider.entity';
import { Filtering } from "../helpers/decorators/filtering-params.decorator";
import { Pagination } from "../helpers/decorators/params-params.decorator";
import { Sorting } from "../helpers/decorators/sorting-params.decorator";
import { getOrder, getWhereQB } from "../helpers/typeOrm.helper";
import { PaginatedResource } from "../helpers/paginatedResource.type";
import { Genre } from "./entities/genre.entity";

@Injectable()
export class WatchableService {
  constructor(
    @InjectRepository(Watchable)
    private watchableRepository: Repository<Watchable>,
    @InjectRepository(Provider)
    private providerRepository: Repository<Provider>,
    @InjectRepository(Genre)
    private genresRepository: Repository<Genre>
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
    const where = getWhereQB(filter);
    const order = getOrder(sort);
    const newOrder: [string, string] | string | any = Object.entries(order)[0];

    /*const [watchables, total] = await this.watchableRepository.findAndCount({
      //relations: ['genres'],
      where,
      order,
      take: limit,
      skip: offset,
    });*/
    const qb = this.watchableRepository.createQueryBuilder('Watchable')
      .innerJoin("Watchable.provider", "provider");

    if (where.length > 0 && Object.getOwnPropertyNames(where[1]).includes('genres'))
      qb.innerJoin("Watchable.genres", "genres");

    if (newOrder)
      qb.orderBy(`Watchable.${newOrder[0]}`, newOrder[1].toUpperCase());


    const [watchables, total] = await qb
      .where(where.length > 0 ? where[0] : '', where.length > 0 ? where[1] : '')
      .take(limit)
      .skip(offset)
      .getManyAndCount();

    /*const watchables = await this.watchableRepository.find({
      relations: ['genres'],
      where,
      order,
      take: limit,
      skip: offset,
    });

    const total = await this.watchableRepository.count({ where });*/

    return {
      totalItems: total,
      items: watchables,
      page: (page + 1),
      size: size
    };
  }

  async findOne(id: number) {
    return await this.watchableRepository.findOne({ relations: ["genres", "provider"], where: { id: id } });
  }

  async getGenres() {
    return await this.genresRepository.find();
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

  async deactivate(id: number) {
    const watchable = await this.watchableRepository.findOne({where: {id: id}});
    watchable.deactivate_at = new Date();
    return await this.watchableRepository.save(watchable);
  }

  async restore(id: number) {
    const watchable = await this.watchableRepository.findOne({where: {id: id}});
    watchable.deactivate_at = null;
    return await this.watchableRepository.save(watchable);
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
