import { Command } from 'Command';

import {
  Embed,
  User,
  GuildMember,
  Role,
  Activity,
  PermissionsString,
} from 'Root';

export default class extends Command {

  constructor () {
    super({
      name: 'user',
      options: [
        {
          name: 'avatar',
          description: 'Shows user avatar.',
          type: 1,
          options: [
            {
              name: 'user',
              description: 'User tag or identity.',
              type: 6,
              required: false,
            },
            {
              name: 'ephemeral',
              description: 'Ephemeral response.',
              type: 5,
              required: false,
            },
          ],
        },
        {
          name: 'banner',
          description: 'Shows user banner.',
          type: 1,
          options: [
            {
              name: 'user',
              description: 'User tag or identity.',
              type: 6,
              required: false,
            },
            {
              name: 'ephemeral',
              description: 'Ephemeral response.',
              type: 5,
              required: false,
            },
          ],
        },
        {
          name: 'info',
          description: 'Shows user information.',
          type: 1,
          options: [
            {
              name: 'user',
              description: 'User tag or identity.',
              type: 6,
              required: false,
            },
            {
              name: 'ephemeral',
              description: 'Ephemeral response.',
              type: 5,
              required: false,
            },
          ],
        },
      ],

      cooldown: { time: '5s', global: true },

      category: 'information',

      developerOnly: false,
      ownerOnly: false,
      permissions: false,

      enabled: true,
    });
  };

  async execute ({ interaction }: { interaction: CommandInteraction; }): Execute {

    let ephemeral: boolean = interaction.options.getBoolean('ephemeral');

    if (interaction.options.getSubcommand(false) === 'avatar') {

      let user: User = interaction.options.getUser('user') || interaction.user;

      await ctx.menu.paginate(interaction, {
        ephemeral,
        menus: async () => [
          {
            value: [
              new Embed({
                color: Number(`0x${await ctx.case.imageColor(user.displayAvatarURL({ size: 128, extension: `png` }))}`),
                author: {
                  name: `User Avatar`,
                  iconURL: client.user.displayAvatarURL(),
                  url: Data.InviteURL,
                },
                title: `${user.tag}`,
                url: `https://lookup.guru/${user.id}`,
                image: {
                  url: user.displayAvatarURL({ forceStatic: false, size: 512, extension: `png` }),
                },
              }),
            ],
            links: [
              {
                label: `Avatar URL`,
                url: user.displayAvatarURL({ forceStatic: false, size: 512, extension: `png` }),
              },
            ],
          },
        ],
      });
    };

    if (interaction.options.getSubcommand(false) === 'banner') {

      let user: User = interaction.options.getUser('user') || interaction.user;

      await client.users.fetch(user.id, { force: true });

      await ctx.menu.paginate(interaction, {
        ephemeral,
        menus: async () => [
          {
            value: [
              new Embed({
                color: user.banner ? Number(`0x${await ctx.case.imageColor(user.bannerURL({ size: 128, extension: `png` }))}`) : user.accentColor ? Number(`0x${user.hexAccentColor.slice(1)}`) : Number(`0x${await ctx.case.imageColor(user.displayAvatarURL({ size: 128, extension: `png` }))}`),
                author: {
                  name: `User Banner`,
                  iconURL: client.user.displayAvatarURL(),
                  url: Data.InviteURL,
                },
                title: `${user.tag}`,
                url: `https://lookup.guru/${user.id}`,
                image: {
                  url: user.banner ? user.bannerURL({ forceStatic: false, size: 512, extension: `png` }) : `https://singlecolorimage.com/get/${user.accentColor ? user.hexAccentColor.slice(1) : await ctx.case.imageColor(user.displayAvatarURL({ size: 128, extension: `png` }))}/600x240`,
                },
              }),
            ],
            links: [
              {
                label: `Banner URL`,
                url: user.banner ? user.bannerURL({ forceStatic: false, size: 512, extension: `png` }) : `https://singlecolorimage.com/get/${user.accentColor ? user.hexAccentColor.slice(1) : await ctx.case.imageColor(user.displayAvatarURL({ size: 128, extension: `png` }))}/600x240`,
              },
            ],
          },
        ],
      });
    };

    if (interaction.options.getSubcommand(false) === 'info') {

      let user: User = interaction.options.getUser('user') || interaction.user;
      let member: GuildMember = interaction.guild.members.cache.get(user.id);

      await client.users.fetch(user.id, { force: true });

      if (user.bot) return await interaction.errorReply({ content: `This command can only be used on users.` });

      if (!member) {

        await ctx.menu.paginate(interaction, {
          ephemeral,
          menus: async () => [
            {
              value: [
                new Embed({
                  color: Color.Default,
                  thumbnail: {
                    url: user.displayAvatarURL({ forceStatic: false, size: 512, extension: `png` }),
                  },
                  author: {
                    name: `User Information`,
                    iconURL: client.user.displayAvatarURL(),
                    url: Data.InviteURL,
                  },
                  title: `${user.tag}`,
                  url: `https://lookup.guru/${user.id}`,
                  fields: [
                    { name: `Badges`, value: user.badges(), inline: false },
                    { name: `Registration Date`, value: `${(user.createdTimestamp).toUnix('F')} (${(user.createdTimestamp).toUnix('R')})`, inline: false },
                  ],
                  image: {
                    url: user.banner ? user.bannerURL({ forceStatic: false, size: 512, extension: `png` }) : `https://singlecolorimage.com/get/${user.accentColor ? user.hexAccentColor.slice(1) : await ctx.case.imageColor(user.displayAvatarURL({ size: 128, extension: `png` }))}/600x240`,
                  },
                }),
              ],
              links: [
                {
                  label: `Avatar URL`,
                  url: user.displayAvatarURL({ forceStatic: false, size: 512, extension: `png` }),
                },
                {
                  label: `Banner URL`,
                  url: user.banner ? user.bannerURL({ forceStatic: false, size: 512, extension: `png` }) : `https://singlecolorimage.com/get/${user.accentColor ? user.hexAccentColor.slice(1) : await ctx.case.imageColor(user.displayAvatarURL({ size: 128, extension: `png` }))}/600x240`,
                },
              ],
            },
          ],
        });
      };

      if (member) {

        let statusList: { [index in 'online' | 'idle' | 'dnd' | 'offline' | 'invisible']: string; } = {
          online: `Online`,
          idle: `Idle`,
          dnd: `Do not disturb`,
          offline: `Offline`,
          invisible: `Offline`,
        };

        let customStatus: string = member.presence && member.presence?.status !== `offline` ? member.presence?.activities.filter((activity: Activity) => activity.type === 4).length && member.presence?.activities.find((activity: Activity) => activity.type === 4).state ? member.presence?.activities.find((activity: Activity) => activity.type === 4).state : `` : ``;

        let connectionList: { [index in 'desktop' | 'web' | 'mobile']: string; } = {
          desktop: `Desktop App`,
          web: `Web Browser`,
          mobile: `Mobile App`,
        };

        let activityList: { [index in Numbers<0, 6>]: string; } = {
          0: `Playing`,
          1: `Streaming`,
          2: `Listening to`,
          3: `Watching`,
          4: ``,
          5: ``,
        };

        await ctx.menu.paginate(interaction, {
          ephemeral,
          menus: async () => [
            {
              label: `General`,
              value: [
                new Embed({
                  color: Color.Default,
                  thumbnail: {
                    url: user.displayAvatarURL({ forceStatic: false, size: 512, extension: `png` }),
                  },
                  author: {
                    name: `User Information`,
                    iconURL: client.user.displayAvatarURL(),
                    url: Data.InviteURL,
                  },
                  title: `${user.tag}`,
                  url: `https://lookup.guru/${user.id}`,
                  description: customStatus ? ctx.case.filter(customStatus) : null,
                  fields: [
                    { name: `Badges`, value: user.badges(), inline: false },
                    { name: `Status`, value: `${member.presence && member.presence?.status !== `offline` ? statusList[member.presence?.status] : statusList.offline}`, inline: true },
                    { name: `Connections ${member.presence && member.presence?.status !== `offline` ? member.presence?.clientStatus ? `(${Object.keys(member.presence?.clientStatus).length})` : `` : ``}`, value: `${member.presence && member.presence?.status !== `offline` ? member.presence?.clientStatus ? Object.keys(member.presence?.clientStatus).map((activity: string) => connectionList[activity as 'desktop' | 'web' | 'mobile']).join(`\n`) : `None` : `None`}`, inline: true },
                    { name: `Activities ${member.presence && member.presence?.status !== `offline` ? member.presence?.activities.filter((activity: Activity) => activity.type !== 4).length ? `(${member.presence?.activities.filter((activity: Activity) => activity.type !== 4).length})` : `` : ``}`, value: `${member.presence && member.presence?.status !== `offline` ? member.presence?.activities.filter((activity: Activity) => activity.type !== 4).length ? member.presence?.activities.filter((activity: Activity) => activity.type !== 4).map((activity: Activity) => `\`•\` ${activity.type === 2 && activity.name === `Spotify` ? `Listening to [**${activity.details}**](https://open.spotify.com/track/ '${activity.details}\nby ${activity.state.replaceAll(`;`, `,`)}${activity.details === activity.assets.largeText ? `` : `\non ${activity.assets.largeText}`}')` : activity.name ? ` ${activityList[activity.type]} **${activity.name}**` : `None`}`).join(`\n`) : `None` : `None`}`, inline: false },
                    { name: `Registration Date`, value: `${user.createdTimestamp.toUnix('F')} (${(user.createdTimestamp).toUnix('R')})`, inline: false },
                    { name: `Join Date`, value: `${member.joinedTimestamp.toUnix('F')} (${(member.joinedTimestamp).toUnix('R')})`, inline: false },
                  ],
                  image: {
                    url: user.banner ? user.bannerURL({ forceStatic: false, size: 512, extension: `png` }) : `https://singlecolorimage.com/get/${user.accentColor ? user.hexAccentColor.slice(1) : await ctx.case.imageColor(user.displayAvatarURL({ size: 128, extension: `png` }))}/600x240`,
                  },
                }),
              ],
              links: [
                {
                  label: `Avatar URL`,
                  url: user.displayAvatarURL({ forceStatic: false, size: 512, extension: `png` }),
                },
                {
                  label: `Banner URL`,
                  url: user.banner ? user.bannerURL({ forceStatic: false, size: 512, extension: `png` }) : `https://singlecolorimage.com/get/${user.accentColor ? user.hexAccentColor.slice(1) : await ctx.case.imageColor(user.displayAvatarURL({ size: 128, extension: `png` }))}/600x240`,
                },
              ],
            },
            {
              label: `Roles & Permissions`,
              value: [
                new Embed({
                  color: Color.Default,
                  thumbnail: {
                    url: user.displayAvatarURL({ forceStatic: false, size: 512, extension: `png` }),
                  },
                  author: {
                    name: `User Information`,
                    iconURL: client.user.displayAvatarURL(),
                    url: Data.InviteURL,
                  },
                  title: `${user.tag}`,
                  url: `https://lookup.guru/${user.id}`,
                  description: customStatus ? ctx.case.filter(customStatus) : null,
                  fields: [
                    { name: `Roles ${member.roles.cache.filter((role: Role) => role.id !== interaction.guild.roles.everyone.id).size > 0 ? `(${member.roles.cache.filter((role: Role) => role.id !== interaction.guild.roles.everyone.id).size})` : ``}`, value: `${member.roles.cache.filter((role: Role) => role.id !== interaction.guild.roles.everyone.id).size > 0 ? [ ...member.roles.cache.filter((role: Role) => role.id !== interaction.guild.roles.everyone.id).values() ].sort((first: Role, last: Role) => last.position - first.position).slice(0, 10).map((role: Role, index: number) => `\`${index + 1}.\` ${role}  ${role.hexColor === '#000000' ? `` : `[\`?\`](https://www.colorhexa.com/${role.hexColor.slice(1)} '${role.hexColor.toUpperCase()}')`}`).join('\n') : `None`} ${member.roles.cache.size > 11 ? `[\`+${member.roles.cache.size - 11}\`](https://discord.com '+${member.roles.cache.size - 11} more role${member.roles.cache.size - 11 === 1 ? `` : `s`}.')` : ``}`, inline: true },
                    { name: `Permissions ${member.permissions.has('Administrator') ? `(1)` : member.permissions.toArray().length > 0 ? `(${member.permissions.toArray().length})` : ``}`, value: `${member.permissions.has('Administrator') ? `\`1.\` Administrator` : member.permissions.toArray().slice(0, 10).map((permission: PermissionsString, index: number) => `\`${index + 1}.\` ${ctx.case.permission(permission)}`).join(`\n`)} ${member.permissions.has('Administrator') ? `[\`?\`](https://discord.com 'This user has all existing permissions.')` : member.permissions.toArray().length > 10 ? `[\`+${member.permissions.toArray().length - 10}\`](https://discord.com '+${member.permissions.toArray().length - 10} more permission${member.permissions.toArray().length - 10 === 1 ? `` : `s` }.')` : ``}`, inline: true },
                  ],
                  image: {
                    url: user.banner ? user.bannerURL({ forceStatic: false, size: 512, extension: `png` }) : `https://singlecolorimage.com/get/${user.accentColor ? user.hexAccentColor.slice(1) : await ctx.case.imageColor(user.displayAvatarURL({ size: 128, extension: `png` }))}/600x240`,
                  },
                }),
              ],
              links: [
                {
                  label: `Avatar URL`,
                  url: user.displayAvatarURL({ forceStatic: false, size: 512, extension: `png` }),
                },
                {
                  label: `Banner URL`,
                  url: user.banner ? user.bannerURL({ forceStatic: false, size: 512, extension: `png` }) : `https://singlecolorimage.com/get/${user.accentColor ? user.hexAccentColor.slice(1) : await ctx.case.imageColor(user.displayAvatarURL({ size: 128, extension: `png` }))}/600x240`,
                },
              ],
            },
          ],
        });
      };
    };
  };
};