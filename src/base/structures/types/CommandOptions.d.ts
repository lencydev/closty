import { ApplicationCommandOptionData, PermissionsString } from 'Root';

export declare global {

  type CommandCategories = 'developer' | 'information' | 'moderation' | 'other';

  interface CommandOptions {

    name: string;
    description?: string;
    options?: ApplicationCommandOptionData[];

    cooldown?: { time: string; global: boolean; } | false;

    category?: CommandCategories;

    developerOnly?: boolean;
    ownerOnly?: boolean;
    permissions?: { executor: PermissionsString[] | false; client: PermissionsString[] | false; } | false;

    enabled?: boolean;
  };
};