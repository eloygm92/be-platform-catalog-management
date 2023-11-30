import { Injectable } from "@nestjs/common";
import { CreateExtractorDto } from './dto/create-extractor.dto';
import { UpdateExtractorDto } from './dto/update-extractor.dto';
import * as process from "process";
import { constants } from "../constants";
import { ProviderService } from "../provider/provider.service";
import { CreateProviderDto } from "../provider/dto/create-provider.dto";

@Injectable()
export class ExtractorService {

  constructor(
    private readonly providerService: ProviderService,
  ) {}

  private API_OPTIONS = {
    method: 'GET',
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${process.env.API_TOKEN}`
    }
  }

  async getProviders() {
    const baseUrl = `${process.env.API_URL}/${constants.WATCH}/${constants.PROVIDERS}/`;

    const res = await fetch(`${baseUrl}${constants.MOVIE}?language=${process.env.API_LANG}&watch_region=ES`, this.API_OPTIONS);
    const SetProviders = new Set();
    if(res.ok) {
      const jsonMovie = await res.json()
      jsonMovie.results.forEach((provider) => {
        SetProviders.add(JSON.stringify({ logo_path: provider.logo_path, name: provider.provider_name, external_id: provider.provider_id, type: constants.MOVIE }))
      })
    } else {
      throw new Error(res.statusText)
    }

    const res2 = await fetch(`${baseUrl}${constants.TV}?language=${process.env.API_LANG}&watch_region=ES`, this.API_OPTIONS);
    if(res2.ok) {
      const jsonTv = await res2.json()
      jsonTv.results.forEach((provider) => {
        SetProviders.add(JSON.stringify({ logo_path: provider.logo_path, name: provider.provider_name, external_id: provider.provider_id, type: constants.TV }))
      })
    } else {
      throw new Error(res2.statusText)
    }

    const setSavedProviders = new Set();
    const savedProviders = await this.providerService.findAll();

    savedProviders.forEach((provider) => {
      setSavedProviders.add(JSON.stringify({ logo_path: provider.logo_path, name: provider.name, external_id: provider.external_id, type: provider.type }));
    })

    const diffElements = [...SetProviders].filter((provider) => !setSavedProviders.has(provider))

    if(diffElements.length > 0) {
      const dataDto: CreateProviderDto[] = diffElements.map((provider: any) => JSON.parse(provider))
      return await this.providerService.massiveCreate(dataDto);
    }
    return { "msg": constants.EMPTY_MESSAGE + constants.PROVIDERS };
  }

  /*create(createExtractorDto: CreateExtractorDto) {
    return 'This action adds a new extractor';
  }

  findAll() {
    return `This action returns all extractor`;
  }

  findOne(id: number) {
    return `This action returns a #${id} extractor`;
  }

  update(id: number, updateExtractorDto: UpdateExtractorDto) {
    return `This action updates a #${id} extractor`;
  }

  remove(id: number) {
    return `This action removes a #${id} extractor`;
  }*/
}
