import { Injectable } from '@nestjs/common';
import { CreateEpisodeDto } from './dto/create-episode.dto';
import { UpdateEpisodeDto } from './dto/update-episode.dto';
import { Episode } from './entities/episode.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Season } from '../season/entities/season.entity';

@Injectable()
export class EpisodeService {
  constructor(
    @InjectRepository(Episode)
    private episodeRepository: Repository<Episode>,
    @InjectRepository(Season)
    private seasonRepository: Repository<Season>,
  ) {}

  async create(createEpisodeDto: CreateEpisodeDto) {
    const { season, ...createEpisodeDataDto } = createEpisodeDto;

    createEpisodeDataDto['season'] = await this.seasonRepository.findOneBy({
      id: season,
    });

    const episode = this.episodeRepository.create(createEpisodeDataDto);
    await this.episodeRepository.save(episode);
    return episode;
  }

  async findAll() {
    return await this.episodeRepository.find();
  }

  async findOne(id: number) {
    return await this.episodeRepository.findOneBy({ id });
  }

  async update(id: number, updateEpisodeDto: UpdateEpisodeDto) {
    const { season, ...updateEpisodeDataDto } = updateEpisodeDto;
    if (season) {
      updateEpisodeDataDto['season'] = await this.seasonRepository.findOneBy({
        id: season,
      });
    }
    const updated = await this.episodeRepository.update(
      id,
      updateEpisodeDataDto,
    );
    return updated.affected === 1 ? this.findOne(id) : false;
  }

  async remove(id: number) {
    return await this.episodeRepository.delete(id);
  }
}
