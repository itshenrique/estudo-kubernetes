import { User } from '../domain/user';

export interface IUserRepository {
  findByUuid(body: Pick<User, 'uuid'>): Promise<User>;

  findByTelegramId(body: Pick<User, 'telegramId'>): Promise<User>;

  save(body: Partial<User>): Promise<User>;

  pushSerieUuidInUserByUuid(
    body: Pick<User, 'uuid'>,
    serieUuid: string,
  ): Promise<boolean>;
}
