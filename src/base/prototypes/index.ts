/* eslint-disable @typescript-eslint/typedef */

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
  UserFlagsString,
} from 'Root';

(async function (): Promise<void> {

  Date.prototype.toUnix = function (type?: 't' | 'T' | 'd' | 'D' | 'f' | 'F' | 'R'): string {

    return `<t:${Math.floor(new Date(this).getTime() / 1000)}:${type || 'F'}>`;
  };

  Number.prototype.toUnix = function (type?: 't' | 'T' | 'd' | 'D' | 'f' | 'F' | 'R'): string {

    return `<t:${Math.floor(new Date(this as number).getTime() / 1000)}:${type || 'F'}>`;
  };

  let interactions = [
    AppInteraction,
    CommandInteraction,
    StringSelectMenuInteraction,
    UserSelectMenuInteraction,
    RoleSelectMenuInteraction,
    ChannelSelectMenuInteraction,
    ButtonInteraction,
    ModalSubmitInteraction,
  ];

  await Promise.all(interactions.map((interaction) => {

    interaction.prototype.successReply = async function ({ ephemeral, content, timeout }: { ephemeral?: boolean; content: string | string[]; timeout?: number; }): Promise<void> {

      let options: { ephemeral: boolean; content: string; } = {
        ephemeral: timeout ? false : ephemeral,
        content: `${Emoji.Success} ${content instanceof Array ? content.join(`\n`) : content}`,
      };

      if (this.replied) await this.editReply(options).then(() => timeout ? setTimeout(async () => await this.deleteReply().catch(() => undefined), timeout) : undefined);
      else if (this.deferred) await this.followUp(options).then(() => timeout ? setTimeout(async () => await this.deleteReply().catch(() => undefined), timeout) : undefined);
      else await this.reply(options).then(() => timeout ? setTimeout(async () => await this.deleteReply().catch(() => undefined), timeout) : undefined);
    };

    interaction.prototype.errorReply = async function ({ content }: { content: string | string[]; }): Promise<void> {

      let options: { ephemeral: boolean; content: string; } = {
        ephemeral: true,
        content: `${Emoji.Error} ${content instanceof Array ? content.join(`\n`) : content}`,
      };

      if (this.replied) await this.editReply(options);
      else if (this.deferred) await this.followUp(options);
      else await this.reply(options);
    };
  }));

  User.prototype.badges = function (): string {

    let badges: string[] = [];

    if (this.flags?.toArray().length > 0) {

      (Object.keys(Emoji.Badge) as UserFlagsString[]).map((badge: UserFlagsString) => {

        if (this.flags.has(badge)) badges.push(ctx.case.badge(badge, { icon: true }));
      });
    };

    return badges.length > 0 ? badges.join(``) : `None`;
  };

  User.prototype.link = function (block?: boolean, options: { full?: boolean; } = { full: true }): string {

    return `[${block ? `\`${ctx.case.filter(options.full ? this.tag : this.username)}\`` : ctx.case.filter(this.tag)}](<https://lookup.guru/${this.id}> '${ctx.case.filter(this.tag)} (${this.id})')`;
  };

  Guild.prototype.link = function (bold?: boolean): string {

    let guildName: string = bold ? `**${ctx.case.filter(this.name.length > 20 ? `${this.name.slice(0, 20)}...` : this.name)}**` : ctx.case.filter(this.name);

    return this.vanityURLCode ? `[${guildName}](https://discord.gg/${this.vanityURLCode} 'discord.gg/${this.vanityURLCode}')` : guildName;
  };

  GuildEmoji.prototype.link = function (block?: boolean): string {

    return `[${block ? `\`${this.name}\`` : this.name}](${this.url} 'Click it and view the "${this.name}" emoji in the browser.')`;
  };
})();