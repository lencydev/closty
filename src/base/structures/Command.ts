export class Command {

  public readonly name;
  public readonly description;
  public readonly options;

  public readonly cooldown;

  public readonly category;

  public readonly developerOnly;
  public readonly ownerOnly;
  public readonly permissions;

  public readonly enabled;

  constructor (command: CommandOptions) {

    this.name = command.name;
    this.description = command.description ?? 'undefined';
    this.options = command.options ?? [];

    this.cooldown = command.cooldown ?? false;

    this.category = command.category ?? 'other';

    this.developerOnly = command.developerOnly ?? false;
    this.ownerOnly = command.ownerOnly ?? false;
    this.permissions = command.permissions ?? false;

    this.enabled = command.enabled ?? false;
  };

  async execute ({ interaction }: { interaction: CommandInteraction; }): Execute {

    logger.send(`Method not found. ${TextColor(`(${interaction.commandName})`, '#F1F258')}`, { type: 2 });
  };
};