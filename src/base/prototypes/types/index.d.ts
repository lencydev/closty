import {
  AppInteraction,
  CommandInteraction,
  StringSelectMenuInteraction,
  UserSelectMenuInteraction,
  RoleSelectMenuInteraction,
  ChannelSelectMenuInteraction,
  ButtonInteraction,
  ModalSubmitInteraction,
  User,
  Guild,
  GuildEmoji,
} from 'Root';

export declare global {

  interface Date {
    toUnix (type?: 't' | 'T' | 'd' | 'D' | 'f' | 'F' | 'R'): string;
  };

  interface Number {
    toUnix (type?: 't' | 'T' | 'd' | 'D' | 'f' | 'F' | 'R'): string;
  };
};

export declare module 'discord.js' {

  interface AppInteraction {
    successReply ({ ephemeral, content, timeout }: { ephemeral?: boolean; content: string | string[]; timeout?: number; }): Promise<void>;
    errorReply ({ ephemeral, content }: { ephemeral?: boolean; content: string | string[]; }): Promise<void>;
  };

  interface CommandInteraction {
    successReply ({ ephemeral, content, timeout }: { ephemeral?: boolean; content: string | string[]; timeout?: number; }): Promise<void>;
    errorReply ({ ephemeral, content }: { ephemeral?: boolean; content: string | string[]; }): Promise<void>;
  };

  interface StringSelectMenuInteraction {
    successReply ({ ephemeral, content, timeout }: { ephemeral?: boolean; content: string | string[]; timeout?: number; }): Promise<void>;
    errorReply ({ ephemeral, content }: { ephemeral?: boolean; content: string | string[]; }): Promise<void>;
  };

  interface UserSelectMenuInteraction {
    successReply ({ ephemeral, content, timeout }: { ephemeral?: boolean; content: string | string[]; timeout?: number; }): Promise<void>;
    errorReply ({ ephemeral, content }: { ephemeral?: boolean; content: string | string[]; }): Promise<void>;
  };

  interface RoleSelectMenuInteraction {
    successReply ({ ephemeral, content, timeout }: { ephemeral?: boolean; content: string | string[]; timeout?: number; }): Promise<void>;
    errorReply ({ ephemeral, content }: { ephemeral?: boolean; content: string | string[]; }): Promise<void>;
  };

  interface ChannelSelectMenuInteraction {
    successReply ({ ephemeral, content, timeout }: { ephemeral?: boolean; content: string | string[]; timeout?: number; }): Promise<void>;
    errorReply ({ ephemeral, content }: { ephemeral?: boolean; content: string | string[]; }): Promise<void>;
  };

  interface ButtonInteraction {
    successReply ({ ephemeral, content, timeout }: { ephemeral?: boolean; content: string | string[]; timeout?: number; }): Promise<void>;
    errorReply ({ ephemeral, content }: { ephemeral?: boolean; content: string | string[]; }): Promise<void>;
  };

  interface ModalSubmitInteraction {
    successReply ({ ephemeral, content, timeout }: { ephemeral?: boolean; content: string | string[]; timeout?: number; }): Promise<void>;
    errorReply ({ ephemeral, content }: { ephemeral?: boolean; content: string | string[]; }): Promise<void>;
  };

  interface User {
    badges (): string;
    link (block?: boolean, options: { full?: boolean; } = { full: true }): string;
  };

  interface Guild {
    link (bold?: boolean): string;
  };

  interface GuildEmoji {
    link (block?: boolean): string;
  };
};