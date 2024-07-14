import { Injectable } from '@nestjs/common';
import * as process from 'process';
import * as dayjs from 'dayjs';
import { constants } from '../constants';
import { EntityManager, Repository } from "typeorm";
import { Watchable } from '../watchable/entities/watchable.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Genre } from '../watchable/entities/genre.entity';
import { Provider } from '../provider/entities/provider.entity';
import { Season } from '../season/entities/season.entity';
import { Episode } from '../episode/entities/episode.entity';

@Injectable()
export class ExtractorService {
  constructor(
    @InjectRepository(Provider)
    private readonly providerRepository: Repository<Provider>,
    @InjectRepository(Watchable)
    private readonly watchableRepository: Repository<Watchable>,
    @InjectRepository(Genre)
    private readonly genreRepository: Repository<Genre>,
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

  private readonly API_OPTIONS: object;

  async getProviders() {
    const tryQuery = await this.checkItsPossibleToQuery();
    if (!tryQuery) return { message: 'No se puede realizar la consulta' };
    else {
      const baseUrl = `${process.env.API_URL}/${constants.WATCH}/${constants.PROVIDERS}/`;

      const res = await fetch(
        `${baseUrl}${constants.MOVIE}?language=${process.env.API_LANG}&watch_region=ES`,
        this.API_OPTIONS
      );

      const providersStored = await this.providerRepository.find();
      if (res.ok) {
        const jsonProvidersMovie: {
          results: {
            display_priorities: object,
            display_priority: object,
            logo_path: string,
            provider_name: string,
            provider_id: number
          }[]
        } = await res.json();

        for await (const providerMovie of jsonProvidersMovie.results) {
          const foundProvider = providersStored.find(
            (provider) => provider.external_id === providerMovie.provider_id
          );

          if (foundProvider) {
            foundProvider.name = providerMovie.provider_name;
            foundProvider.logo_path = providerMovie.logo_path;
          } else {
            const newProvider = new Provider();
            newProvider.name = providerMovie.provider_name;
            newProvider.logo_path = providerMovie.logo_path;
            newProvider.external_id = providerMovie.provider_id;
            providersStored.push(this.providerRepository.create(newProvider));
          }
        }
        await this.providerRepository.save(providersStored);
      }

      const res2 = await fetch(
        `${baseUrl}${constants.TV}?language=${process.env.API_LANG}&watch_region=ES`,
        this.API_OPTIONS
      );

      if (res2.ok) {
        const jsonProvidersTv: {
          results: {
            display_priorities: object,
            display_priority: object,
            logo_path: string,
            provider_name: string,
            provider_id: number
          }[]
        } = await res2.json();
        for await (const providerTv of jsonProvidersTv.results) {
          const foundProvider = providersStored.find(
            (provider) => provider.external_id === providerTv.provider_id
          );

          if (foundProvider) {
            foundProvider.name = providerTv.provider_name;
            foundProvider.logo_path = providerTv.logo_path;
          } else {
            const newProvider = new Provider();
            newProvider.name = providerTv.provider_name;
            newProvider.logo_path = providerTv.logo_path;
            newProvider.external_id = providerTv.provider_id;
            providersStored.push(this.providerRepository.create(newProvider));
          }
        }
        await this.providerRepository.save(providersStored);
      }

      return { msg: constants.FINISHED + " " + constants.PROVIDERS };
    }
  }

  async getUpcomingMovies() {
    const tryQuery = await this.checkItsPossibleToQuery();
    if (!tryQuery) return { message: 'No se puede realizar la consulta' };
    else {
      await this.blockQuery(false, "new_tvs");
      const baseUrl = `${process.env.API_URL}/${constants.MOVIE}/${constants.UPCOMING}`;

      const res = await fetch(
        `${baseUrl}?language=${process.env.API_LANG}&page=1`,
        this.API_OPTIONS
      );
      if (res.ok) {
        const jsonData = await res.json();
        const genresSaved = await this.genreRepository.find();
        const providersSaved = await this.providerRepository.find();
        await this.mapperUpcomingMovies(
          jsonData.results,
          genresSaved,
          providersSaved
        );
        const totalPages = jsonData.total_pages ?? 1;
        for (let i = 2; i <= totalPages; i++) {
          const res2 = await fetch(
            `${baseUrl}?language=${process.env.API_LANG}&page=${i}`,
            this.API_OPTIONS
          );
          if (res2.ok) {
            const jsonData2 = await res2.json();
            await this.mapperUpcomingMovies(
              jsonData2.results,
              genresSaved,
              providersSaved
            );
          }
        }
        await this.blockQuery(true, "new_tvs");
      }
    }
  }

  async getAiringTodaySeries() {
    const tryQuery = Boolean(
      (await this.entityManager.query(
        "SELECT value_status FROM configuration WHERE name = 'load_news'",
      )).value_status,
    );
    if (!tryQuery) return { message: 'No se puede realizar la consulta' };
    else {
      await this.blockQuery(false, "new_movies");
      const baseUrl = `${process.env.API_URL}/${constants.DISCOVER}/${constants.TV}`;
      const currentDate = dayjs();
      const prevDate = currentDate.subtract(7, "d");
      const futDate = currentDate.add(3, "w");

      const res = await fetch(
        `${baseUrl}?air_date.gte=${prevDate.format(
          "YYYY-MM-DD"
        )}&air_date.lte=${futDate.format(
          "YYYY-MM-DD"
        )}&include_adult=false&include_null_first_air_dates=false&language=es-ES&page=1&sort_by=popularity.desc`,
        this.API_OPTIONS
      );
      if (res.ok) {
        const jsonData = await res.json();

        const genresSaved = await this.genreRepository.find();
        const providersSaved = await this.providerRepository.find();
        await this.mapperAiringTodaySeries(
          jsonData.results,
          genresSaved,
          providersSaved
        );
        const totalPages = jsonData.total_pages ?? 1;

        for (let i = 2; i <= totalPages; i++) {
          const nextPage = await fetch(
            `${baseUrl}?air_date.gte=${prevDate.format(
              "YYYY-MM-DD"
            )}&air_date.lte=${futDate.format(
              "YYYY-MM-DD"
            )}&include_adult=false&include_null_first_air_dates=false&language=es-ES&page=${i}&sort_by=popularity.desc`,
            this.API_OPTIONS
          );
          if (nextPage.ok) {
            const jsonData2 = await nextPage.json();
            await this.mapperAiringTodaySeries(
              jsonData2.results,
              genresSaved,
              providersSaved
            );
          }
        }
        await this.blockQuery(true, "new_movies");
      }
    }
  }

  async mapperUpcomingMovies(
    jsonData: any,
    genresSaved: Genre[],
    providersSaved: Provider[],
  ) {
    for await (const jsonMovie of jsonData) {
      if (!jsonMovie.adult) {
        let watchable = await this.watchableRepository.findOne({
          relations: ['genres', 'provider'],
          where: { external_id: jsonMovie.id },
        });

        if (!watchable) {
          watchable = new Watchable();
          watchable = this.watchableRepository.create(watchable);
        } else {
          watchable.control = !watchable.control;
        }
        const watchableData: any = await fetch(
          `https://api.themoviedb.org/3/movie/${jsonMovie.id}?append_to_response=watch/providers&language=es-ES`,
          this.API_OPTIONS,
        )
          .then((res) => res.json())
          .then((dataJson) => dataJson);

        if (watchableData['watch/providers'].results?.ES) {
          if (
            watchableData['watch/providers'].results.ES.flatrate?.length > 0
          ) {
            watchable.provider = watchableData[
              'watch/providers'
            ].results.ES.flatrate.map((provider: any) =>
              providersSaved.find(
                (providerAux) =>
                  providerAux.external_id === provider.provider_id,
              ),
            );
          }
          if (watchableData['watch/providers'].results?.ES?.ads?.length > 0) {
            const providesAux = watchableData['watch/providers'].results.ES.ads.map(
              (provider: any) =>
                providersSaved.find(
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

        watchable.name = watchableData.title;
        watchable.type = constants.MOVIE;
        watchable.original_name = watchableData.original_title;
        watchable.external_id = jsonMovie.id;
        watchable.overview = jsonMovie.overview;
        watchable.release_date =
          jsonMovie.release_date === '' ? null : jsonMovie.release_date;
        watchable.vote_average = jsonMovie.vote_average;
        watchable.vote_count = jsonMovie.vote_count;
        watchable.poster_path = jsonMovie.poster_path;
        watchable.backdrop_path = jsonMovie.backdrop_path;
        jsonMovie.genres?.length > 0
          ? (watchable.genres = jsonMovie.genres.map((genre: any) =>
              genresSaved.find((genreAux) => genreAux.external_id === genre.id),
            ))
          : '';
        watchable.popularity = jsonMovie.popularity;
        await this.watchableRepository.save(watchable);
      }
    }
  }

  async mapperAiringTodaySeries(
    jsonData: any,
    genresSaved: Genre[],
    providersSaved: Provider[],
  ) {
    for await (const jsonSerie of jsonData) {
      if (!jsonSerie.adult) {
        let watchable = await this.watchableRepository.findOne({
          relations: ['genres', 'provider'],
          where: { external_id: jsonSerie.id },
        });

        if (!watchable) {
          watchable = new Watchable();
          watchable = this.watchableRepository.create(watchable);
        } else {
          watchable.control = !watchable.control;
        }
        const watchableData: any = await fetch(
          `https://api.themoviedb.org/3/tv/${jsonSerie.id}?append_to_response=watch/providers&language=es-ES`,
          this.API_OPTIONS,
        )
          .then((res) => res.json())
          .then((dataJson) => dataJson);

        if (watchableData['watch/providers'].results?.ES) {
          if (
            watchableData['watch/providers'].results.ES.flatrate?.length > 0
          ) {
            watchable.provider = watchableData[
              'watch/providers'
            ].results.ES.flatrate.map((provider: any) =>
              providersSaved.find(
                (providerAux) =>
                  providerAux.external_id === provider.provider_id,
              ),
            );
          }
          if (watchableData['watch/providers'].results?.ES?.ads?.length > 0) {
            const providesAux = watchableData['watch/providers'].results.ES.ads.map(
              (provider: any) =>
                providersSaved.find(
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

        watchable.name = watchableData.name;
        watchable.original_name = watchableData.original_name;
        watchable.type = constants.TV;
        watchable.external_id = jsonSerie.id;
        watchable.overview = watchableData.overview;
        watchable.release_date = watchableData.first_air_date;
        watchable.vote_average = watchableData.vote_average;
        watchable.vote_count = watchableData.vote_count;
        watchable.poster_path = watchableData.poster_path;
        watchable.backdrop_path = watchableData.backdrop_path;
        jsonSerie.genres?.length > 0
          ? (watchable.genres = jsonSerie.genres.map((genre: any) =>
              genresSaved.find((genreAux) => genreAux.external_id === genre.id),
            ))
          : '';
        watchableData.seasons = await this.getSeasonsAndEpisodesNew(
          watchable,
          watchableData,
        );
        watchable.popularity = jsonSerie.popularity;
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

  async checkItsPossibleToQuery() {
    return Boolean(
      (await this.entityManager.query(
        "SELECT value_status FROM configuration WHERE name = 'load_news'",
      )).value_status,
    );
  }

  async blockQuery(status: boolean, field: string) {
    await this.entityManager.query(
      `UPDATE configuration SET value_status = ${status ? 1 : 0} WHERE name = '${field}'`,
    );
  }
}
