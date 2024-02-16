import { Injectable } from '@nestjs/common';
import * as process from 'process';
import { constants } from '../constants';
import { ProviderService } from '../provider/provider.service';
import { CreateProviderDto } from '../provider/dto/create-provider.dto';
import { Repository } from 'typeorm';
import { Watchable } from '../watchable/entities/watchable.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Genre } from '../watchable/entities/genre.entity';
import { Provider } from '../provider/entities/provider.entity';

@Injectable()
export class ExtractorService {
  constructor(
    private readonly providerService: ProviderService,
    @InjectRepository(Watchable)
    private readonly watchableRepository: Repository<Watchable>,
    @InjectRepository(Genre)
    private readonly genreRepository: Repository<Genre>,
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
    const baseUrl = `${process.env.API_URL}/${constants.WATCH}/${constants.PROVIDERS}/`;

    const res = await fetch(
      `${baseUrl}${constants.MOVIE}?language=${process.env.API_LANG}&watch_region=ES`,
      this.API_OPTIONS,
    );
    const SetProviders = new Set();
    if (res.ok) {
      const jsonMovie = await res.json();
      jsonMovie.results.forEach((provider) => {
        SetProviders.add(
          JSON.stringify({
            logo_path: provider.logo_path,
            name: provider.provider_name,
            external_id: provider.provider_id,
            type: constants.MOVIE,
          }),
        );
      });
    } else {
      throw new Error(res.statusText);
    }

    const res2 = await fetch(
      `${baseUrl}${constants.TV}?language=${process.env.API_LANG}&watch_region=ES`,
      this.API_OPTIONS,
    );
    if (res2.ok) {
      const jsonTv = await res2.json();
      jsonTv.results.forEach((provider) => {
        SetProviders.add(
          JSON.stringify({
            logo_path: provider.logo_path,
            name: provider.provider_name,
            external_id: provider.provider_id,
            type: constants.TV,
          }),
        );
      });
    } else {
      throw new Error(res2.statusText);
    }

    const setSavedProviders = new Set();
    const savedProviders = await this.providerService.findAll();

    savedProviders.forEach((provider) => {
      setSavedProviders.add(
        JSON.stringify({
          logo_path: provider.logo_path,
          name: provider.name,
          external_id: provider.external_id,
          type: provider.type,
        }),
      );
    });

    const diffElements = [...SetProviders].filter(
      (provider) => !setSavedProviders.has(provider),
    );

    if (diffElements.length > 0) {
      const dataDto: CreateProviderDto[] = diffElements.map((provider: any) =>
        JSON.parse(provider),
      );
      return await this.providerService.massiveCreate(dataDto);
    }
    return { msg: constants.EMPTY_MESSAGE + constants.PROVIDERS };
  }

  async getUpcomingMovies() {
    const baseUrl = `${process.env.API_URL}/${constants.MOVIE}/${constants.UPCOMING}`;

    const res = await fetch(
      `${baseUrl}?language=${process.env.API_LANG}&page=1`,
      this.API_OPTIONS,
    );
    if (res.ok) {
      const jsonData = await res.json();
      const genresSaved = await this.genreRepository.find();
      const providersSaved = await this.providerService.findAll();
      await this.mapperUpcomingMovies(
        jsonData.results,
        genresSaved,
        providersSaved,
      );
      const totalPages = jsonData.total_pages ?? 1;
      for (let i = 2; i <= totalPages; i++) {
        const res2 = await fetch(
          `${baseUrl}?language=${process.env.API_LANG}&page=${i}`,
          this.API_OPTIONS,
        );
        if (res2.ok) {
          const jsonData2 = await res2.json();
          await this.mapperUpcomingMovies(
            jsonData2.results,
            genresSaved,
            providersSaved,
          );
        }
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
            const providesAux = watchableData.results.ES.ads.map(
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
}
