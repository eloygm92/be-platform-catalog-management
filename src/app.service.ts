import { Injectable } from '@nestjs/common';
import { InjectRepository } from "@nestjs/typeorm";
import { IsNull, Repository } from "typeorm";
import { Watchable } from "./watchable/entities/watchable.entity";
import { Genre } from "./watchable/entities/genre.entity";
import { Interval } from "@nestjs/schedule";

@Injectable()
export class AppService {
  constructor(
    @InjectRepository(Watchable)
    private readonly watchableRepository: Repository<Watchable>,
    @InjectRepository(Genre)
    private readonly genreRepository: Repository<Genre>,
  ) {
  this.API_OPTIONS = {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.API_TOKEN}`
      }
    }
  }
  private API_OPTIONS: object;

  getHello(): string {
    return 'Hello World!';
  }

  //@Interval(4000)
  async handleTaskWatchableMovie() {
    const watchablesToFetch = await this.watchableRepository.find({ where: { type: 'movie', popularity: IsNull() }, order: { id: 'ASC' }, take: 50 });
    if(watchablesToFetch) {
      const genres = await this.genreRepository.find();
      watchablesToFetch.forEach((watchable) => {
        fetch(`https://api.themoviedb.org/3/movie/${watchable.external_id}?language=es-ES`, this.API_OPTIONS)
          .then((res) => res.json())
          .then((dataJson) => {
            if(dataJson.status_code === 34) {
              watchable.popularity = 0;
              watchable.name = watchable.original_name;
              watchable.overview = '';
            } else {
              watchable.name = dataJson.title;
              watchable.overview = dataJson.overview;
              watchable.release_date = dataJson.release_date === "" ? null : dataJson.release_date;
              watchable.vote_average = dataJson.vote_average;
              watchable.vote_count = dataJson.vote_count;
              watchable.poster_path = dataJson.poster_path;
              dataJson.genres?.length > 0 ? watchable.genres = dataJson.genres.map((genre) => genres.find((genreAux) => genreAux.external_id === genre.id)) : "";
              watchable.popularity = dataJson.popularity;
            }
            this.watchableRepository.save(watchable);
          })
          .catch((err) => console.log(err));
      });
    }
    return watchablesToFetch;
  }

  //@Interval(6000)
  async handleTaskWatchableTv() {
    const watchablesToFetch = await this.watchableRepository.find({ relations: ['seasons'], where: { type: 'tv', popularity: IsNull() }, order: { id: 'ASC' }, take: 50 });
    if(watchablesToFetch) {
      const genres = await this.genreRepository.find();
      watchablesToFetch.forEach((watchable) => {
        fetch(`https://api.themoviedb.org/3/tv/${watchable.external_id}?language=es-ES`, this.API_OPTIONS)
          .then((res) => res.json())
          .then((dataJson) => {
            if(dataJson.status_code === 34) {
              watchable.popularity = 0;
              watchable.name = watchable.original_name;
              watchable.overview = '';
            } else {
              watchable.name = dataJson.name;
              watchable.overview = dataJson.overview;
              watchable.release_date = dataJson.first_air_date === "" ? null : dataJson.first_air_date;
              watchable.vote_average = dataJson.vote_average;
              watchable.vote_count = dataJson.vote_count;
              watchable.poster_path = dataJson.poster_path;
              dataJson.genres?.length > 0 ? watchable.genres = dataJson.genres.map((genre) => genres.find((genreAux) => genreAux.external_id === genre.id)) : "";
              watchable.popularity = dataJson.popularity;
              watchable.seasons = dataJson.seasons.map((season) => {
                const seasonAux = watchable.seasons.find((seasonAux) => seasonAux.external_id === season.id);
                if(seasonAux) {
                  seasonAux.name = season.name;
                  seasonAux.overview = season.overview;
                  seasonAux.poster_path = season.poster_path;
                  seasonAux.air_date = season.air_date === "" ? null : season.air_date;
                  seasonAux.episode_count = season.episode_count;
                  seasonAux.season_number = season.season_number;
                  seasonAux.vote_average = season.vote_average;
                  return seasonAux;
                }
                return { name: season.name, overview: season.overview, poster_path: season.poster_path, air_date: season.air_date === "" ? null : season.air_date, episode_count: season.episode_count, season_number: season.season_number, external_id: season.id, vote_average: season.vote_average };
              });
            }
            this.watchableRepository.save(watchable);
          })
          .catch((err) => console.log(err));
      });
    }
    return watchablesToFetch;
  }
}
