import { Command } from 'Command';

import {
  Embed,
  GuildEmoji,
  BaseGuildEmojiManager,
} from 'Root';

export default class extends Command {

  constructor () {
    super({
      name: 'emojis',
      description: 'Lists all emojis in global or server.',
      options: [
        {
          name: 'global',
          description: 'Global listing.',
          type: 5,
          required: false,
        },
        {
          name: 'ephemeral',
          description: 'Ephemeral response.',
          type: 5,
          required: false,
        },
      ],

      cooldown: { time: '10s', global: false },

      category: 'information',

      developerOnly: false,
      ownerOnly: false,
      permissions: false,

      enabled: true,
    });
  };

  async execute ({ interaction }: { interaction: CommandInteraction; }): Execute {

    let global: boolean = interaction.options.getBoolean('global');
    let ephemeral: boolean = interaction.options.getBoolean('ephemeral');

    let emojis: BaseGuildEmojiManager;
    let description: { animated: string; normal: string; };

    if (global) {

      emojis = client.emojis;

      description = {
        normal: `Emojis that are available on all servers of the bot.`,
        animated: `Animated emojis that are available on all servers of the bot.`,
      };
    };

    if (!global) {

      emojis = interaction.guild.emojis;

      description = {
        normal: `Emojis available on the server.`,
        animated: `Animated emojis available on the server.`,
      };
    };

    await ctx.menu.paginate(interaction, {
      ephemeral,
      pageSize: 10,
      sorts: [
        {
          emoji: Emoji.SelectMenu.Date.NewToOld,
          label: `Date of Added: New to Old`,
          sort: (first: GuildEmoji, last: GuildEmoji) => last.createdTimestamp - first.createdTimestamp,
        },
        {
          emoji: Emoji.SelectMenu.Date.OldToNew,
          label: `Date of Added: Old to New`,
          sort: (first: GuildEmoji, last: GuildEmoji) => first.createdTimestamp - last.createdTimestamp,
        },
      ],
      menus: async (sort: (first: GuildEmoji, last: GuildEmoji) => number) => [
        {
          emoji: `989909762844028989`,
          label: `Emojis (${ctx.case.number(emojis.cache.filter((emoji: GuildEmoji) => emoji.available && !emoji.animated).size)})`,
          description: description.normal,
          value: await Promise.all(emojis.cache.filter((emoji: GuildEmoji) => emoji.available && !emoji.animated).sort(sort).map((emoji: GuildEmoji) => emoji).map((emoji: GuildEmoji, index: number) => `**${index + 1}** ${emoji} ${emoji.link(true)} (${(emoji.createdTimestamp).toUnix('R')})\n`)),
        },
        {
          emoji: `989909761510219816`,
          label: `Animated Emojis (${ctx.case.number(emojis.cache.filter((emoji: GuildEmoji) => emoji.available && emoji.animated).size)})`,
          description: description.animated,
          value: await Promise.all(emojis.cache.filter((emoji: GuildEmoji) => emoji.available && emoji.animated).sort(sort).map((emoji: GuildEmoji) => emoji).map((emoji: GuildEmoji, index: number) => `**${index + 1}** ${emoji} ${emoji.link(true)} (${(emoji.createdTimestamp).toUnix('R')})\n`)),
        },
      ],
      embeds: async (data: Parameters<PaginateOptions['embeds']>[0]) => {
        return [
          new Embed({
            color: Color.Default,
            thumbnail: {
              url: global ? client.user.displayAvatarURL({ forceStatic: false, size: 512, extension: `png` }) : interaction.guild.icon ? interaction.guild.iconURL({ forceStatic: false, size: 512, extension: `png` }) : `https://singlecolorimage.com/get/36393f/512x512`,
            },
            author: {
              name: `${data.label} ${global ? `[GLOBAL]` : ``}`,
              iconURL: client.user.displayAvatarURL(),
              url: Data.InviteURL,
            },
            description: data.value.slice(data.first, data.last).join(``),
          }),
        ];
      },
    });
  };
};