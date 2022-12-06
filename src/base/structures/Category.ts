export abstract class Category {

  public readonly emoji;

  public readonly ownerOnly;
  public readonly permissions;

  public readonly enabled;

  constructor (category: CategoryOptions) {

    this.emoji = category.emoji ?? undefined;

    this.ownerOnly = category.ownerOnly ?? false;
    this.permissions = category.permissions ?? false;

    this.enabled = category.enabled ?? false;
  };

  abstract execute ({ interaction }: { interaction: CommandInteraction; }): Execute;
};