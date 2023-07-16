import { Log } from '../domain/log';

export interface ILogRepository {
  save(body: Partial<Log>): Promise<Log>;
}
