export class Log {
  uuid: string;
  application: string;
  message: string;

  constructor(application: string, message: string, uuid?: string) {
    this.uuid = uuid;
    this.application = application;
    this.message = message;
  }
}
