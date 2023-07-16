export class Choice {
  answer: string;
  imdbId: string;
  name: string;
  poster: string;
}

export class Question {
  uuid: string;
  userUuid: string;
  choices: Choice[];

  constructor(userUuid: string, choices: Choice[], uuid?: string) {
    this.userUuid = userUuid;
    this.choices = choices;
    this.uuid = uuid;
  }
}
