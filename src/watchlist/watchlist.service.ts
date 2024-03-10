import { Injectable } from '@nestjs/common';
import { CreateWatchlistDto } from './dto/create-watchlist.dto';
import { UpdateWatchlistDto } from './dto/update-watchlist.dto';
import { Watchlist } from './entities/watchlist.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Watchable } from '../watchable/entities/watchable.entity';
import { User } from '../user/entities/user.entity';

@Injectable()
export class WatchlistService {
  constructor(
    @InjectRepository(Watchlist)
    private watchlistRepository: Repository<Watchlist>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Watchable)
    private watchableRepository: Repository<Watchable>,
  ) {}

  async create(createWatchlistDto: CreateWatchlistDto) {
    const { watchable, user, ...createWatchlistDataDto } = createWatchlistDto;
    createWatchlistDataDto['watchable'] =
      await this.watchableRepository.findOneBy({ id: watchable });
    createWatchlistDataDto['user'] = await this.userRepository.findOneBy({
      id: user,
    });

    const watchlist = this.watchlistRepository.create(createWatchlistDataDto);
    await this.watchlistRepository.save(watchlist);
    return watchlist;
  }

  async findAll(user_id: number) {
    return await this.watchlistRepository.find({
      select: {
        id: true,
        watchable_id: true,
        view: true,
        watchable: {
          name: true
        }
      },
      relations: ['watchable'],
      where: { user: { id: user_id } },
    });
  }

  async findOne(id: number) {
    return await this.watchlistRepository.findOne({
      relations: ['watchable', 'user'],
      where: { id: id },
    });
  }

  async update(id: number, updateWatchlistDto: UpdateWatchlistDto) {
    const { watchable, user, ...updateWatchlistDataDto } = updateWatchlistDto;
    if (watchable) {
      updateWatchlistDataDto['watchable'] =
        await this.watchlistRepository.findOneBy({ id: watchable });
    }

    if (user) {
      updateWatchlistDataDto['user'] = await this.watchlistRepository.findOneBy(
        { id: user },
      );
    }

    const updated = await this.watchlistRepository.update(
      id,
      updateWatchlistDataDto,
    );
    return updated.affected === 1 ? await this.findOne(id) : false;
  }

  async remove(user_id: number, watchable_id: number) {
    const watchlist_row = await this.watchlistRepository.findOne({
      where: {
        user_id: user_id,
        watchable_id: watchable_id
      }
    })
    return await this.watchlistRepository.remove(watchlist_row);
  }
}
