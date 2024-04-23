import { Injectable } from '@nestjs/common';
import { CreateSeasonDto } from './dto/create-season.dto';
import { UpdateSeasonDto } from './dto/update-season.dto';
import { Season } from './entities/season.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Watchable } from '../watchable/entities/watchable.entity';

@Injectable()
export class SeasonService {
  constructor(
    @InjectRepository(Season)
    private seasonRepository: Repository<Season>,
    @InjectRepository(Watchable)
    private watchableRepository: Repository<Watchable>,
  ) {}
  async create(createSeasonDto: CreateSeasonDto) {
    const { watchable, ...createSeasonDataDto } = createSeasonDto;
    createSeasonDataDto['watchable'] = await this.watchableRepository.findOneBy(
      {
        id: watchable,
      },
    );

    const season = this.seasonRepository.create(createSeasonDataDto);
    await this.seasonRepository.save(season);

    return season;
  }

  async findAll() {
    return await this.seasonRepository.find();
  }

  async findOne(id: number) {
    return await this.seasonRepository.findOneByOrFail({ id });
  }

  async findSeasonsByWatchableId(watchable_id: number) {
    return await this.seasonRepository.find({ relations: ['episodes'], where: { watchableId: watchable_id } });
  }

  async update(id: number, updateSeasonDto: UpdateSeasonDto) {
    const { watchable, ...updateSeasonDataDto } = updateSeasonDto;

    if (watchable) {
      updateSeasonDataDto['watchable'] =
        await this.watchableRepository.findOneBy({
          id: watchable,
        });
    }

    const updated = await this.seasonRepository.update(id, updateSeasonDataDto);
    return updated.affected === 1 ? await this.findOne(id) : false;
  }

  async remove(id: number) {
    return await this.seasonRepository.delete(id);
  }
}
