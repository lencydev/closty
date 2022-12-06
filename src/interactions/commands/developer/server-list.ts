import { Command } from 'Command';

import {
  Collection,
  Embed,
  Guild,
  Invite,
  GuildBasedChannel,
  TextChannel,
  parseEmoji,
} from 'Root';

export default class extends Command {

  constructor () {
    super({
      name: 'server-list',
      description: 'Lists all servers where the bot is located.',
      options: [
        {
          name: 'ephemeral',
          description: 'Ephemeral response.',
          type: 5,
          required: false,
        },
      ],

      cooldown: false,

      category: 'developer',

      developerOnly: true,
      ownerOnly: false,
      permissions: false,

      enabled: true,
    });
  };

  async execute ({ interaction }: { interaction: CommandInteraction; }): Execute {

    let ephemeral: boolean = interaction.options.getBoolean('ephemeral');

    let tiers: { [index in Numbers<0, 4>]: { emoji: string; count: string; }; } = {
      0: { emoji: Emoji.Utils.Tier.Zero, count: `/2` },
      1: { emoji: Emoji.Utils.Tier.One, count: `/7` },
      2: { emoji: Emoji.Utils.Tier.Two, count: `/14` },
      3: { emoji: Emoji.Utils.Tier.Three, count: `` },
    };

    await ctx.menu.paginateWithTransactions(interaction, {
      ephemeral,
      pageSize: 6,
      sorts: [
        {
          emoji: Emoji.SelectMenu.Date.NewToOld,
          label: `Date of Added: New to Old`,
          sort: (first: Guild, last: Guild) => last.members.cache.get(client.user.id).joinedTimestamp - first.members.cache.get(client.user.id).joinedTimestamp,
        },
        {
          emoji: Emoji.SelectMenu.Date.OldToNew,
          label: `Date of Added: Old to New`,
          sort: (first: Guild, last: Guild) => first.members.cache.get(client.user.id).joinedTimestamp - last.members.cache.get(client.user.id).joinedTimestamp,
        },
        {
          emoji: Emoji.SelectMenu.Members.LargeToSmall,
          label: `Number of Members: Large to Small`,
          sort: (first: Guild, last: Guild) => last.memberCount - first.memberCount,
        },
        {
          emoji: Emoji.SelectMenu.Members.SmallToLarge,
          label: `Number of Members: Small to Large`,
          sort: (first: Guild, last: Guild) => first.memberCount - last.memberCount,
        },
      ],
      filters: [
        { label: `All Servers`, filter: (guild: Guild) => Boolean(guild) },
        { emoji: parseEmoji(Emoji.Utils.New).id, label: `Servers with Added in the Last 24 Hours`, filter: (guild: Guild) => guild.members.cache.get(client.user.id).joinedTimestamp > new Date(Date.now() - ctx.case.time('24h')).getTime() },
        { emoji: parseEmoji(Emoji.Utils.Tier.One).id, label: `Servers with 2-7 Boosts`, filter: (guild: Guild) => guild.premiumSubscriptionCount >= 2 && guild.premiumSubscriptionCount < 7 },
        { emoji: parseEmoji(Emoji.Utils.Tier.Two).id, label: `Servers with 7-14 Boosts`, filter: (guild: Guild) => guild.premiumSubscriptionCount >= 7 && guild.premiumSubscriptionCount < 14 },
        { emoji: parseEmoji(Emoji.Utils.Tier.Three).id, label: `Servers with +14 Boosts`, filter: (guild: Guild) => guild.premiumSubscriptionCount >= 14 },
        { emoji: parseEmoji(Emoji.Utils.DiscordPartnerServer).id, label: `Servers with Discord Partner`, filter: (guild: Guild) => guild.partnered && !guild.verified },
        { emoji: parseEmoji(Emoji.Utils.VerifiedServer).id, label: `Servers with Verified`, filter: (guild: Guild) => guild.verified && !guild.partnered },
        { emoji: parseEmoji(Emoji.Utils.VerifiedAndPartneredServer).id, label: `Servers with Verified & Partnered`, filter: (guild: Guild) => guild.verified && guild.partnered },
        { emoji: `989195761881321514`, label: `Servers with Custom Invite Link`, filter: (guild: Guild) => guild.vanityURLCode ? true : false },
        { emoji: `991147703390187590`, label: `Servers with 1-10 Members`, filter: (guild: Guild) => guild.memberCount >= 1 && guild.memberCount <= 10 },
        { emoji: `991147703390187590`, label: `Servers with 10-100 Members`, filter: (guild: Guild) => guild.memberCount >= 10 && guild.memberCount <= 100 },
        { emoji: `991147703390187590`, label: `Servers with 100-1K Members`, filter: (guild: Guild) => guild.memberCount >= 100 && guild.memberCount <= 1000 },
        { emoji: `991147703390187590`, label: `Servers with 1K-10K Members`, filter: (guild: Guild) => guild.memberCount >= 1000 && guild.memberCount <= 10000 },
        { emoji: `991147703390187590`, label: `Servers with 10K-100K Members`, filter: (guild: Guild) => guild.memberCount >= 10000 && guild.memberCount <= 100000 },
        { emoji: `991147703390187590`, label: `Servers with +100K Members`, filter: (guild: Guild) => guild.memberCount >= 100000 },
      ],
      menus: async (sort: (first: Guild, last: Guild) => number, filters: Array<{ emoji?: string; label?: string; description?: string; filter: (value: Guild) => boolean; }>) => [
        ...await Promise.all(filters.map((filter: { emoji?: string; label?: string; description?: string; filter: (value: Guild) => boolean; }) => {
          return {
            emoji: filter.emoji || undefined,
            label: `${filter.label} (${ctx.case.number(client.guilds.cache.filter(filter.filter).size)})`,
            value: client.guilds.cache.filter(filter.filter).sort(sort).map((guild: Guild) => guild).map((guild: Guild) => [
              `[${guild.verified && guild.partnered ? Emoji.Utils.VerifiedAndPartneredServer : guild.verified ? Emoji.Utils.VerifiedServer : guild.partnered ? Emoji.Utils.DiscordPartnerServer : tiers[guild.premiumTier].emoji}](${Data.InviteURL} '${guild.premiumSubscriptionCount}${tiers[guild.premiumTier].count} Boosts') ${guild.link(true)}`,
              `${Emoji.ReplyCont} ${Emoji.Utils.Crown} ${client.users.cache.get(guild.ownerId).link(true, { full: false })}`,
              `${Emoji.ReplyCont} ${Emoji.Utils.Members} \`${ctx.case.formattedNumber(guild.memberCount)} / ${ctx.case.formattedNumber(guild.maximumMembers)}\``,
              `${Emoji.Reply} ${Emoji.Utils.Date} ${(guild.members.cache.get(client.user.id).joinedTimestamp).toUnix('R')}`,
            ].join('\n')),
          };
        })),
      ],
      transactions: {
        placeholder: `Get the invite link of the selected server.`,
        get: async (value: string) => client.guilds.cache.get(value),
        options: async (first: number, last: number, sort: (first: Guild, last: Guild) => number, filter: (value: Guild) => boolean) => [
          ...await Promise.all(client.guilds.cache.filter(filter).sort(sort).map((guild: Guild) => guild).slice(first, last).map((guild: Guild) => {
            return {
              emoji: guild.verified && guild.partnered ? parseEmoji(Emoji.Utils.VerifiedAndPartneredServer).id : guild.verified ? parseEmoji(Emoji.Utils.VerifiedServer).id : guild.partnered ? parseEmoji(Emoji.Utils.DiscordPartnerServer).id : parseEmoji(tiers[guild.premiumTier].emoji).id,
              label: guild.name,
              value: guild.id,
              execute: async (menu: StringSelectMenuInteraction, guild: Guild) => {

                try {

                  let channels: Collection<string, GuildBasedChannel> = guild.channels.cache.filter((channel: GuildBasedChannel) => channel.type === 0);

                  let url: Invite = await (channels.random() as TextChannel).createInvite({
                    maxAge: 0,
                    maxUses: 1,
                    unique: true,
                    reason: `Requested by the developer of the bot.`,
                  });

                  await menu.reply({ ephemeral: true, content: `Generated Invite Link: ${url}` });

                } catch {

                  await menu.errorReply({ content: `There is no channel on the server to create invite.` });
                };
              },
            };
          })),
        ],
      },
      embeds: async (data: Parameters<PaginateOptions['embeds']>[0]) => {
        return [
          new Embed({
            color: Color.Default,
            author: {
              name: `Server List`,
              iconURL: client.user.displayAvatarURL(),
              url: Data.InviteURL,
            },
            title: `${data.emoji} ${data.label}`,
            fields: (() => {

              let values: string[] = [];

              data.value.slice(data.first, data.last).map((value: string) => values.push(value));

              if (data.value.slice(data.first, data.last).length === 1 || data.value.slice(data.first, data.last).length === 4) values.push(`\u200B`, `\u200B`);
              if (data.value.slice(data.first, data.last).length === 2 || data.value.slice(data.first, data.last).length === 5) values.push(`\u200B`);

              return [
                ...values.map((value: string) => {
                  return {
                    name: `⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀`,
                    value: value,
                    inline: true,
                  };
                }),
              ];
            })(),
          }),
        ];
      },
    });
  };
};