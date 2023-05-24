export class Serie {
  uuid: string;
  name: string;

  constructor(name: string, uuid?: string) {
    this.uuid = uuid;
    this.name = name;
  }
}
