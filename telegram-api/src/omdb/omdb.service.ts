import { Injectable } from '@nestjs/common';
import axios from 'axios';
import { omdb } from 'src/infra/config';
import { SearchByImdbIdInOmdb, SearchByNameInOmdb } from './interfaces';

@Injectable()
export class OmdbService {
  private baseUrl;

  constructor() {
    this.baseUrl = `https://www.omdbapi.com/`;
  }

  async searchSerieByName(name: string): Promise<SearchByNameInOmdb> {
    const response = await axios.get(this.baseUrl, {
      params: {
        apikey: omdb.apiKey,
        s: name,
        type: 'series',
      },
    });

    return response.data;
  }

  async searchSerieByImdbId(imdbId: string): Promise<SearchByImdbIdInOmdb> {
    const response = await axios.get(this.baseUrl, {
      params: {
        apikey: omdb.apiKey,
        i: imdbId,
        type: 'series',
      },
    });

    return response.data;
  }
}
