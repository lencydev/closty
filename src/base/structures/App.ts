export class App {

  public readonly name;
  public readonly type;

  public readonly cooldown;

  public readonly developerOnly;
  public readonly ownerOnly;
  public readonly permissions;

  public readonly enabled;

  constructor (app: AppOptions) {

    this.name = app.name;
    this.type = app.type;

    this.cooldown = app.cooldown ?? false;

    this.developerOnly = app.developerOnly ?? false;
    this.ownerOnly = app.ownerOnly ?? false;
    this.permissions = app.permissions ?? false;

    this.enabled = app.enabled ?? false;
  };

  async execute ({ interaction }: { interaction: AppInteraction; }): Execute {

    logger.send(`Method not found. ${TextColor(`(${interaction.commandName})`, '#F1F258')}`, { type: 2 });
  };
};