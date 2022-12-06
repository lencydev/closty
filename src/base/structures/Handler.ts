export class Handler {

  public readonly type;
  public readonly enabled;

  constructor (handler: HandlerOptions) {

    this.type = handler.type;
    this.enabled = handler.enabled ?? false;
  };

  async execute (...items: ClientEvents[keyof ClientEvents]): Promise<any> {};
};