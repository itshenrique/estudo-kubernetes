export class Episode {
  number: number;
  airdate: Date;
}
export class Season {
  number: number;
  episodes: Episode[];
}
export class Serie {
  uuid: string;
  name: string;
  seasons: Season[];

  constructor(name: string, seasons: Season[], uuid?: string) {
    this.uuid = uuid;
    this.name = name;
    this.seasons = seasons;
  }
}
