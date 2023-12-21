import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Watchable } from './watchable/entities/watchable.entity';
import { Genre } from './watchable/entities/genre.entity';
import { Interval } from '@nestjs/schedule';
import { Provider } from './provider/entities/provider.entity';
import { Season } from './season/entities/season.entity';

@Injectable()
export class AppService {
  constructor(
    @InjectRepository(Watchable)
    private readonly watchableRepository: Repository<Watchable>,
    @InjectRepository(Genre)
    private readonly genreRepository: Repository<Genre>,
    @InjectRepository(Provider)
    private readonly providersRepository: Repository<Provider>,
  ) {
    this.API_OPTIONS = {
      method: 'GET',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        Authorization: `Bearer ${process.env.API_TOKEN}`,
      },
    };
  }
  private API_OPTIONS: object;

  //@Interval(4000)
  async handleTaskWatchableMovie() {
    const watchablesToFetch = await this.watchableRepository.find({
      relations: ['provider'],
      where: { type: 'movie' },
      order: { updated_at: 'ASC' },
      take: 50,
    });
    if (watchablesToFetch) {
      const genres = await this.genreRepository.find();
      const providers = await this.providersRepository.find();
      watchablesToFetch.forEach((watchable) => {
        fetch(
          `https://api.themoviedb.org/3/movie/${watchable.external_id}?language=es-ES`,
          this.API_OPTIONS,
        )
          .then((res) => res.json())
          .then(async (dataJson) => {
            if (dataJson.status_code === 34) {
              watchable.popularity = 0;
              watchable.name = watchable.original_name;
              watchable.overview = '';
            } else {
              const providersData = await fetch(
                `https://api.themoviedb.org/3/movie/${watchable.external_id}/watch/providers`,
                this.API_OPTIONS,
              )
                .then((res) => res.json())
                .then((dataJson) => {
                  return dataJson.results;
                });
              if (providersData?.ES) {
                if (providersData.ES.flatrate?.length > 0) {
                  watchable.provider = providersData.ES.flatrate.map(
                    (provider: any) =>
                      providers.find(
                        (providerAux) =>
                          providerAux.external_id === provider.provider_id,
                      ),
                  );
                }
              }
              watchable.name = dataJson.title;
              watchable.overview = dataJson.overview;
              watchable.release_date =
                dataJson.release_date === '' ? null : dataJson.release_date;
              watchable.vote_average = dataJson.vote_average;
              watchable.vote_count = dataJson.vote_count;
              watchable.poster_path = dataJson.poster_path;
              dataJson.genres?.length > 0
                ? (watchable.genres = dataJson.genres.map((genre: any) =>
                    genres.find(
                      (genreAux) => genreAux.external_id === genre.id,
                    ),
                  ))
                : '';
              watchable.popularity = dataJson.popularity;
            }
            watchable.control = !watchable.control;
            this.watchableRepository.save(watchable);
          })
          .catch((err) => console.log(err));
      });
    }
    return watchablesToFetch;
  }

  //@Interval(10000)
  async handleTaskWatchableTv() {
    const watchablesToFetch = await this.watchableRepository.find({
      relations: ['seasons', 'provider', 'seasons.episodes'],
      where: { type: 'tv' },
      order: { updated_at: 'ASC' },
      take: 20,
    });
    if (watchablesToFetch) {
      const genres = await this.genreRepository.find();
      const providers = await this.providersRepository.find();
      watchablesToFetch.forEach((watchable) => {
        fetch(
          `https://api.themoviedb.org/3/tv/${watchable.external_id}?language=es-ES`,
          this.API_OPTIONS,
        )
          .then((res) => res.json())
          .then(async (dataJson) => {
            if (dataJson.status_code === 34) {
              watchable.popularity = 0;
              watchable.name = watchable.original_name;
              watchable.overview = '';
            } else {
              const providersData = await fetch(
                `https://api.themoviedb.org/3/tv/${watchable.external_id}/watch/providers`,
                this.API_OPTIONS,
              )
                .then((res) => res.json())
                .then((dataJson) => {
                  return dataJson.results;
                });
              if (providersData?.ES) {
                if (providersData.ES.flatrate?.length > 0) {
                  watchable.provider = providersData.ES.flatrate.map(
                    (provider: any) =>
                      providers.find(
                        (providerAux) =>
                          providerAux.external_id === provider.provider_id,
                      ),
                  );
                }
                if (providersData?.ES?.ads?.length > 0) {
                  const providesAux = providersData.ES.ads.map(
                    (provider: any) =>
                      providers.find(
                        (providerAux) =>
                          providerAux.external_id === provider.provider_id,
                      ),
                  );
                  watchable.provider =
                    watchable.provider?.length > 0
                      ? [...watchable.provider, ...providesAux]
                      : providesAux;
                }
              }
              watchable.name = dataJson.name;
              watchable.overview = dataJson.overview;
              watchable.release_date =
                dataJson.first_air_date === '' ? null : dataJson.first_air_date;
              watchable.vote_average = dataJson.vote_average;
              watchable.vote_count = dataJson.vote_count;
              watchable.poster_path = dataJson.poster_path;
              dataJson.genres?.length > 0
                ? (watchable.genres = dataJson.genres.map((genre) =>
                    genres.find(
                      (genreAux) => genreAux.external_id === genre.id,
                    ),
                  ))
                : '';
              watchable.popularity = dataJson.popularity;
              watchable.seasons = await this.getSeasonsAndEpisodes(
                watchable,
                dataJson,
              );
            }
            watchable.control = !watchable.control;
            await this.watchableRepository.save(watchable);
          })
          .catch((err) => console.log(err));
      });
    }
    return watchablesToFetch;
  }

  async getSeasonsAndEpisodes(watchable, dataJson) {
    const seasons: Season[] = [];
    for await (const season of dataJson?.seasons) {
      const seasonAux = watchable.seasons?.find(
        (seasonAux) => seasonAux.external_id === season.id,
      );
      if (seasonAux) {
        seasonAux.name = season.name;
        seasonAux.overview = season.overview;
        seasonAux.poster_path = season.poster_path;
        seasonAux.air_date = season.air_date === '' ? null : season.air_date;
        seasonAux.episode_count = season.episode_count;
        seasonAux.season_number = season.season_number;
        seasonAux.vote_average = season.vote_average;
        seasonAux.vote_count = season.vote_count;
        seasonAux.episodes = await this.getEpisodes(
          watchable.external_id,
          seasonAux,
        );
        seasonAux.control = !seasonAux.control;
        seasons.push(seasonAux);
      } else {
        const newSeason = new Season();
        newSeason.name = season.name;
        newSeason.overview = season.overview;
        newSeason.poster_path = season.poster_path;
        newSeason.air_date = season.air_date === '' ? null : season.air_date;
        newSeason.episode_count = season.episode_count;
        newSeason.season_number = season.season_number;
        newSeason.external_id = season.id;
        newSeason.vote_average = season.vote_average;
        newSeason.vote_count = season.vote_count;
        newSeason.episodes = await this.getEpisodes(
          watchable.external_id,
          season,
        );
        seasons.push(newSeason);
      }
    }
    return seasons;
  }

  async getEpisodes(watchable_external_id: number, season: Season) {
    return await fetch(
      `https://api.themoviedb.org/3/tv/${watchable_external_id}/season/${season.season_number}?language=es-ES`,
      this.API_OPTIONS,
    )
      .then((res) => res.json())
      .then((dataJson) => {
        if (dataJson.status_code !== 34) {
          if (dataJson.episodes?.length > 0) {
            return dataJson.episodes?.map((episode) => {
              const episodeAux = season?.episodes?.find(
                (episodeAux) => episodeAux.external_id === episode.id,
              );

              if (episodeAux) {
                episodeAux.name = episode.name;
                episodeAux.overview = episode.overview;
                episodeAux.air_date =
                  episode.air_date === '' ? null : episode.air_date;
                episodeAux.episode_number = episode.episode_number;
                episodeAux.vote_average = episode.vote_average;
                episodeAux.vote_count = episode.vote_count;
                return episodeAux;
              }

              return {
                name: episode.name,
                overview: episode.overview,
                air_date: episode.air_date === '' ? null : episode.air_date,
                episode_number: episode.episode_number,
                external_id: episode.id,
                vote_average: episode.vote_average,
                vote_count: episode.vote_count,
              };
            });
          }
        }
      });
  }
}
