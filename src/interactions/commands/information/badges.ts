import { Command } from 'Command';

import {
  Embed,
  UserFlagsString,
  GuildMember,
  parseEmoji,
} from 'Root';

type Badge = { id: UserFlagsString; size: number; };

export default class extends Command {

  constructor () {
    super({
      name: 'badges',
      description: 'Lists the total badge information of the members on the server.',
      options: [
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

    let ephemeral: boolean = interaction.options.getBoolean('ephemeral');

    let badges: Badge[] = await Promise.all((Object.keys(Emoji.Badge) as UserFlagsString[]).map((badge: UserFlagsString) => ({ id: badge, size: interaction.guild.members.cache.filter((member: GuildMember) => member.user.flags.has(badge)).size })));

    await ctx.menu.paginate(interaction, {
      ephemeral,
      pageSize: 10,
      sorts: [
        {
          emoji: Emoji.SelectMenu.Date.NewToOld,
          label: `Date of Join: New to Old`,
          sort: (first: GuildMember, last: GuildMember) => last.joinedTimestamp - first.joinedTimestamp,
        },
        {
          emoji: Emoji.SelectMenu.Date.OldToNew,
          label: `Date of Join: Old to New`,
          sort: (first: GuildMember, last: GuildMember) => first.joinedTimestamp - last.joinedTimestamp,
        },
      ],
      menus: async (sort: (first: GuildMember, last: GuildMember) => number) => [
        {
          label: `Badges`,
          value: [
            new Embed({
              color: Color.Default,
              thumbnail: {
                url: interaction.guild.icon ? interaction.guild.iconURL({ forceStatic: false, size: 512, extension: `png` }) : `https://singlecolorimage.com/get/36393f/512x512`,
              },
              author: {
                name: `Badges`,
                iconURL: client.user.displayAvatarURL(),
                url: Data.InviteURL,
              },
              description: (await Promise.all(badges.map((badge: Badge) => `${ctx.case.badge(badge.id, { icon: true })} ${ctx.case.badge(badge.id)}: \`${ctx.case.number(badge.size)}\``))).join(`\n`),
            }),
          ],
        },
        ...await Promise.all(badges.map((badge: Badge) => {
          return {
            emoji: parseEmoji(ctx.case.badge(badge.id, { icon: true })).id,
            label: `${ctx.case.badge(badge.id)} (${ctx.case.number(badge.size)})`,
            value: interaction.guild.members.cache.filter((member: GuildMember) => member.user.flags.has(badge.id)).sort(sort).map((member: GuildMember) => member).map((member: GuildMember, index: number) => `**${ctx.case.number(index + 1)}** ${member.user.link(true)} ${member.user.badges()} (${(member.joinedTimestamp).toUnix('R')})\n`),
            errorResponse: `There are no users with the \`${ctx.case.badge(badge.id)}\` badge on the server.`,
          };
        })),
      ],
      embeds: async (data: Parameters<PaginateOptions['embeds']>[0]) => {
        return [
          new Embed({
            color: Color.Default,
            thumbnail: {
              url: interaction.guild.icon ? interaction.guild.iconURL({ forceStatic: false, size: 512, extension: `png` }) : `https://singlecolorimage.com/get/36393f/512x512`,
            },
            author: {
              name: `Badges`,
              iconURL: client.user.displayAvatarURL(),
              url: Data.InviteURL,
            },
            title: `${data.emoji} ${data.label}`,
            description: data.value.slice(data.first, data.last).join(``),
          }),
        ];
      },
    });
  };
};