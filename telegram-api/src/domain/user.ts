export class User {
  uuid: string;
  telegramId: number;
  name: string;
  seriesUuid: string[];

  constructor(
    name: string,
    telegramId: number,
    seriesUuid: string[],
    uuid?: string,
  ) {
    this.uuid = uuid;
    this.name = name;
    this.telegramId = telegramId;
    this.seriesUuid = seriesUuid;
  }
}
