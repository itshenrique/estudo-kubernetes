import { Serie } from '../domain/serie';

export interface ISerieRepository {
  findByUuid(body: Pick<Serie, 'uuid'>): Promise<Serie>;
  findByName(body: Pick<Serie, 'name'>): Promise<Serie>;
  findInUuidArray(uuidArray: string[]): Promise<Serie[]>;
  save(body: Partial<Serie>): Promise<Serie>;
}
