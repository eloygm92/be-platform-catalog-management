import { Injectable } from '@nestjs/common';
import { CreateProviderDto } from './dto/create-provider.dto';
import { UpdateProviderDto } from './dto/update-provider.dto';
import { Provider } from './entities/provider.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Pagination } from "../helpers/decorators/params-params.decorator";
import { Sorting } from "../helpers/decorators/sorting-params.decorator";
import { Filtering } from "../helpers/decorators/filtering-params.decorator";
import { PaginatedResource } from "../helpers/paginatedResource.type";
import { getOrder, getWhere } from "../helpers/typeOrm.helper";

@Injectable()
export class ProviderService {
  constructor(
    @InjectRepository(Provider)
    private providerRepository: Repository<Provider>,
  ) {}

  async create(createProviderDto: CreateProviderDto) {
    const provider = this.providerRepository.create(createProviderDto);
    return await this.providerRepository.save(provider);
  }

  async massiveCreate(createProviderDto: CreateProviderDto[]) {
    const createdProviders = createProviderDto.reduce((acc, providerDto) => {
      const provider = this.providerRepository.create(providerDto);
      acc.push(provider);
      return acc;
    }, []);
    await this.providerRepository.save(createdProviders);
    return createdProviders;
  }
  async findAll(
    { page, limit, size, offset }: Pagination,
    sort?: Sorting,
    filter?: Filtering[],
  ): Promise<PaginatedResource<Partial<Provider>>> {
    const where = getWhere(filter);
    const order = getOrder(sort);

    const [providers, total] = await this.providerRepository.findAndCount({
      where,
      order,
      take: limit,
      skip: offset,
    });

    return {
      totalItems: total,
      items: providers,
      page: (page + 1),
      size: size,
    }
  }

  async findAllSelect() {
    return await this.providerRepository.find();
  }

  async findOne(id: number) {
    return await this.providerRepository.findOneBy({ id });
  }

  async findProvidersByWatchableId(id: number) {
    return await this.providerRepository.find({ relations: ['watchables'], where: { watchables: { id } } });
  }

  async update(id: number, updateProviderDto: UpdateProviderDto) {
    const updated = await this.providerRepository.update(id, updateProviderDto);
    return updated.affected === 1 ? this.findOne(id) : false;
  }

  async remove(id: number) {
    const removed = await this.providerRepository.update(id, {
      deleted_at: new Date(),
    });
    return removed.affected === 1;
  }
}
