export class Event {

  public readonly type;
  public readonly enabled;

  constructor (event: EventOptions) {

    this.type = event.type;
    this.enabled = event.enabled ?? false;
  };

  async execute (...items: ClientEvents[keyof ClientEvents]): Promise<void> {};
};