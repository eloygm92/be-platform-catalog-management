import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, Repository } from 'typeorm';
import { Watchable } from './watchable/entities/watchable.entity';
import { Genre } from './watchable/entities/genre.entity';
import { Cron } from '@nestjs/schedule';
import { Provider } from './provider/entities/provider.entity';
import { Season } from './season/entities/season.entity';
import { Episode } from './episode/entities/episode.entity';

@Injectable()
export class AppService {
  constructor(
    @InjectRepository(Watchable)
    private readonly watchableRepository: Repository<Watchable>,
    @InjectRepository(Genre)
    private readonly genreRepository: Repository<Genre>,
    @InjectRepository(Provider)
    private readonly providersRepository: Repository<Provider>,
    @InjectRepository(Season)
    private readonly seasonsRepository: Repository<Season>,
    @InjectRepository(Episode)
    private readonly episodesRepository: Repository<Episode>,
    private readonly entityManager: EntityManager,
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

  @Cron('* */2 * * * *')
  async taskUpdate() {
    const idsToUpdated = await this.watchableRepository.find({
      select: ['id', 'type'],
      order: { updated_at: 'ASC' },
      take: 10,
    });

    if (idsToUpdated.length > 0) {
      for await (const watchable of idsToUpdated) {
        if (watchable.type === 'tv') {
          await this.handleTaskTv(watchable.id);
        } else {
          await this.handleTaskMovie(watchable.id);
        }
      }
    }
  }

  //@Interval(4000)
  async handleTaskMovie(watchableId?: number | undefined) {
    const tryQuery = Boolean(
      (await this.entityManager.query(
        "SELECT value_status FROM configuration WHERE name = 'news_movies'",
      )).value_status,
    );
    console.log(tryQuery, 'tryQuery');
    if (!tryQuery) return { message: 'No se puede realizar la consulta' };
    else {
      let watchablesToFetch: Watchable[] = [];
      if (watchableId) {
        watchablesToFetch = await this.watchableRepository.find({
          relations: ["provider"],

          //where: { type: 'tv' },
          where: { id: watchableId },
          order: { updated_at: "ASC" }
          //take: 20,
        });
      } else {
        watchablesToFetch = await this.watchableRepository.find({
          relations: ["provider"],
          where: { type: "movie" },
          order: { updated_at: "ASC" },
          take: 20
        });
      }

      if (watchablesToFetch.length > 0) {
        const genres = await this.genreRepository.find();
        const providers = await this.providersRepository.find();
        for await (const watchable of watchablesToFetch) {
          const dataJson: any = await fetch(
            `https://api.themoviedb.org/3/movie/${watchable.external_id}?language=es-ES`,
            this.API_OPTIONS
          ).then((res) => res.json());
          const watchableData: Watchable = Object.assign({}, watchable);
          if (dataJson.status_code === 34) {
            watchableData.popularity = 0;
            watchableData.name = watchable.original_name;
            watchableData.overview = "";
          } else {
            const providersData: any = await fetch(
              `https://api.themoviedb.org/3/movie/${watchable.external_id}/watch/providers`,
              this.API_OPTIONS
            )
              .then((res) => res.json())
              .then((dataJson) => dataJson.results);

            if (providersData?.ES) {
              if (providersData.ES.flatrate?.length > 0) {
                watchableData.provider = providersData.ES.flatrate.map(
                  (provider: any) =>
                    providers.find(
                      (providerAux) =>
                        providerAux.external_id === provider.provider_id
                    )
                );
              }
              if (providersData?.ES?.ads?.length > 0) {
                const providesAux = providersData.ES.ads.map((provider: any) =>
                  providers.find(
                    (providerAux) =>
                      providerAux.external_id === provider.provider_id
                  )
                );
                watchableData.provider =
                  watchable.provider?.length > 0
                    ? [...watchable.provider, ...providesAux]
                    : providesAux;
              }
            }
            watchableData.name = dataJson.title;
            watchableData.overview = dataJson.overview;
            watchableData.release_date =
              dataJson.release_date === "" ? null : dataJson.release_date;
            watchableData.vote_average = dataJson.vote_average;
            watchableData.vote_count = dataJson.vote_count;
            watchableData.poster_path = dataJson.poster_path;
            watchableData.backdrop_path = dataJson.backdrop_path;
            watchableData.tagline = dataJson.tagline;
            dataJson.genres?.length > 0
              ? (watchable.genres = dataJson.genres.map((genre: any) =>
                genres.find((genreAux) => genreAux.external_id === genre.id)
              ))
              : "";
            watchableData.popularity = dataJson.popularity;
          }
          watchableData.control = !watchable.control;
          await this.watchableRepository.save(watchableData);
        }
        return watchablesToFetch;
      }
    }
  }

  //@Interval(10000)
  async handleTaskTv(watchableId?: number | undefined) {
    const tryQuery = Boolean(
      (await this.entityManager.query(
        "SELECT value_status FROM configuration WHERE name = 'new_tvs'",
      )).value_status,
    );
    console.log(tryQuery, 'tryQuery');
    if (!tryQuery) return { message: 'No se puede realizar la consulta' };
    else {
      let watchablesToFetch: Watchable[] = [];
      if (watchableId) {
        watchablesToFetch = await this.watchableRepository.find({
          relations: ["seasons", "provider"],
          //where: { type: 'tv' },
          where: { id: watchableId },
          order: { updated_at: "ASC" }
          //take: 20,
        });
      } else {
        watchablesToFetch = await this.watchableRepository.find({
          relations: ["seasons", "provider"],
          where: { type: "tv" },
          //where: { id: 936622 },
          order: { updated_at: "ASC" },
          take: 20
        });
      }

      if (watchablesToFetch.length > 0) {
        const genres = await this.genreRepository.find();
        const providers = await this.providersRepository.find();
        for await (const watchable of watchablesToFetch) {
          try {
            const watchableData: Watchable = Object.assign({}, watchable);
            const dataJson: any = await fetch(
              `https://api.themoviedb.org/3/tv/${watchable.external_id}?language=es-ES`,
              this.API_OPTIONS
            ).then((res) => res.json());

            if (dataJson.status_code === 34) {
              watchableData.popularity = 0;
              watchableData.name = watchable.original_name;
              watchableData.overview = "";
            } else {
              const providersData: any = await fetch(
                `https://api.themoviedb.org/3/tv/${watchable.external_id}/watch/providers`,
                this.API_OPTIONS
              )
                .then((res) => res.json())
                .then((dataJson) => dataJson.results);

              if (providersData?.ES) {
                if (providersData?.ES?.flatrate?.length > 0) {
                  watchableData.provider = providersData.ES.flatrate.map(
                    (provider: any) =>
                      providers.find(
                        (providerAux) =>
                          providerAux.external_id === provider.provider_id
                      )
                  );
                }
                if (providersData?.ES?.ads?.length > 0) {
                  const providesAux = providersData.ES.ads.map((provider: any) =>
                    providers.find(
                      (providerAux) =>
                        providerAux.external_id === provider.provider_id
                    )
                  );
                  watchableData.provider =
                    watchable.provider?.length > 0
                      ? [...watchable.provider, ...providesAux]
                      : providesAux;
                }
              }
              watchableData.name = dataJson.name;
              watchableData.overview = dataJson.overview;
              watchableData.release_date =
                dataJson.first_air_date === "" ? null : dataJson.first_air_date;
              watchableData.vote_average = dataJson.vote_average;
              watchableData.vote_count = dataJson.vote_count;
              watchableData.poster_path = dataJson.poster_path;
              watchableData.backdrop_path = dataJson.backdrop_path;
              watchableData.tagline = dataJson.tagline;
              dataJson.genres?.length > 0
                ? (watchable.genres = dataJson.genres.map((genre) =>
                  genres.find((genreAux) => genreAux.external_id === genre.id)
                ))
                : "";
              watchableData.popularity = dataJson.popularity;

              watchableData.seasons = await this.getSeasonsAndEpisodesNew(
                watchable,
                dataJson
              );
            }
            watchableData.control = !watchable.control;
            await this.watchableRepository.save(watchableData);
          } catch (err) {
            console.log(err);
          }
        }
        return watchablesToFetch;
      }
    }
  }

  async getSeasonsAndEpisodesNew(watchable: Watchable, dataJson: any) {
    const seasonsStored: Season[] = await this.seasonsRepository.find({
      relations: ['episodes'],
      where: { watchableId: watchable.id },
    });

    if (dataJson.seasons) {
      const seasonsToStored: Season[] = [];
      for await (const season of dataJson?.seasons) {
        const seasonLocated = seasonsStored?.find(
          (seasonAux) => seasonAux.external_id === season.id,
        );
        if (seasonLocated) {
          seasonLocated.name = season.name;
          seasonLocated.overview = season.overview;
          seasonLocated.poster_path = season.poster_path;
          seasonLocated.air_date =
            season.air_date === '' ? null : season.air_date;
          seasonLocated.episode_count = season.episode_count;
          seasonLocated.season_number = season.season_number;
          seasonLocated.vote_average = season.vote_average;
          seasonLocated.vote_count = season.vote_count;
          seasonLocated.episodes = await this.getEpisodesNew(
            watchable.external_id,
            seasonLocated,
          );
          seasonLocated.control = !seasonLocated.control;

          seasonsToStored.push(seasonLocated);
        } else {
          const newSeason = new Season();
          newSeason.name =
            season.name.length > 250
              ? season.name.slice(0, 247) + '...'
              : season.name;
          newSeason.overview = season.overview;
          newSeason.poster_path = season.poster_path;
          newSeason.air_date = season.air_date === '' ? null : season.air_date;
          newSeason.episode_count = season.episode_count;
          newSeason.season_number = season.season_number;
          newSeason.external_id = season.id;
          newSeason.vote_average = season.vote_average;
          newSeason.vote_count = season.vote_count;
          newSeason.episodes = await this.getEpisodesNew(
            watchable.external_id,
            newSeason,
          );

          const createdSeason = this.seasonsRepository.create(newSeason);
          seasonsToStored.push(createdSeason);
        }
      }
      await this.seasonsRepository.save(seasonsToStored);
      return seasonsToStored;
    }
  }

  async getEpisodesNew(
    watchable_external_id: number,
    season: Season,
  ): Promise<Episode[]> {
    const dataJson: any = await fetch(
      `https://api.themoviedb.org/3/tv/${watchable_external_id}/season/${season.season_number}?language=es-ES`,
      this.API_OPTIONS,
    ).then((res) => res.json());

    if (dataJson?.status_code !== 34) {
      const episodesToStored: Episode[] = [];
      if (dataJson?.episodes) {
        for await (const episode of dataJson?.episodes) {
          const episodeLocate = season.episodes?.find(
            (episodeAux) => episodeAux.external_id === episode.id,
          );
          if (episodeLocate) {
            episodeLocate.name = episode.name;
            episodeLocate.overview = episode.overview;
            episodeLocate.air_date =
              episode.air_date === '' ? null : episode.air_date;
            episodeLocate.episode_number = episode.episode_number;
            episodeLocate.vote_average = episode.vote_average;
            episodeLocate.vote_count = episode.vote_count;
            //episodeLocate.control = !episodeLocate.control;

            episodesToStored.push(episodeLocate);
          } else {
            const newEpisode = new Episode();
            newEpisode.name =
              episode.name.length > 250
                ? episode.name.slice(0, 247) + '...'
                : episode.name;
            newEpisode.overview = episode.overview;
            newEpisode.air_date =
              episode.air_date === '' ? null : episode.air_date;
            newEpisode.episode_number = episode.episode_number;
            newEpisode.external_id = episode.id;
            newEpisode.vote_average = episode.vote_average;
            newEpisode.vote_count = episode.vote_count;

            const createdEpisode = this.episodesRepository.create(newEpisode);
            episodesToStored.push(createdEpisode);
          }
        }
        return episodesToStored;
      }
    }
  }

  async getConfig() {
    return await this.entityManager.query('SELECT * FROM configuration');
  }

  async getConfigByName(name: string) {
    return await this.entityManager.query(
      `SELECT value_status FROM configuration WHERE name = '${name}'`,
    );
  }

  async setConfig(name: string, value: number) {
    const returned = await this.entityManager.query(
      `UPDATE configuration SET value_status = '${value}' WHERE name = '${name}'`,
    );

    if (returned.affectedRows > 0)
      return { message: 'Configuración actualizada' };
    return { message: 'No se pudo actualizar la configuración' };
  }
}
