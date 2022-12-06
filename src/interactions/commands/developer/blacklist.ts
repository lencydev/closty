import { Command } from 'Command';

import { Blacklist } from 'Schemas';

import {
  User,
  Embed,
} from 'Root';

type BlacklistData = { user: string; addedTimestamp: Date; reason: string; value: string; };

export default class extends Command {

  constructor () {
    super({
      name: 'blacklist',
      options: [
        {
          name: 'list',
          description: 'Lists the users in the blacklist.',
          type: 1,
          options: [
            {
              name: 'ephemeral',
              description: 'Ephemeral response.',
              type: 5,
              required: false,
            },
          ],
        },
        {
          name: 'add',
          description: 'Adds the user to the blacklist.',
          type: 1,
          options: [
            {
              name: 'user',
              description: 'User tag or identity.',
              type: 6,
              required: true,
            },
            {
              name: 'reason',
              description: 'Reason for process.',
              type: 3,
              required: false,
            },
          ],
        },
        {
          name: 'remove',
          description: 'Removes the user from the blacklist.',
          type: 1,
          options: [
            {
              name: 'user',
              description: 'User tag or identity.',
              type: 6,
              required: true,
            },
          ],
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

    let data = async (id: string): Promise<SchemaType<BlacklistSchema>> => await Blacklist.findOne({ user: id });

    if (interaction.options.getSubcommand(false) === 'list') {

      let ephemeral: boolean = interaction.options.getBoolean('ephemeral');

      let blacklist: BlacklistSchema[] = await Blacklist.find();
      let blacklistArray: BlacklistData[] = [];

      await Promise.all(blacklist.map(async (value: BlacklistSchema) => {

        let user: User;

        await client.users.fetch(value.user).then((fetch: User) => user = fetch).catch(() => undefined);

        if (!user) return (await data(value.user)).deleteOne();

        blacklistArray.push({ user: user.id, addedTimestamp: value.addedTimestamp, reason: value.reason, value: `${user.link(true)} (${(value.addedTimestamp).toUnix('R')}) ${value.reason ? `[**?**](https://discord.com '${ctx.case.filter(value.reason)}')` : ``}` });
      }));

      await ctx.menu.paginate(interaction, {
        ephemeral,
        pageSize: 10,
        sorts: [
          {
            emoji: Emoji.SelectMenu.Date.NewToOld,
            label: `Date of Blacklisted: New to Old`,
            sort: (first: BlacklistData, last: BlacklistData) => last.addedTimestamp.getTime() - first.addedTimestamp.getTime(),
          },
          {
            emoji: Emoji.SelectMenu.Date.OldToNew,
            label: `Date of Blacklisted: Old to New`,
            sort: (first: BlacklistData, last: BlacklistData) => first.addedTimestamp.getTime() - last.addedTimestamp.getTime(),
          },
        ],
        menus: async (sort: (first: BlacklistData, last: BlacklistData) => number) => [
          {
            value: blacklistArray.sort(sort).map((data: BlacklistData, index: number) => `**${index + 1}** ${data.value}`),
          },
        ],
        embeds: async (data: Parameters<PaginateOptions['embeds']>[0]) => {
          return [
            new Embed({
              color: Color.Default,
              author: {
                name: `Blacklist`,
                iconURL: client.user.displayAvatarURL(),
                url: Data.InviteURL,
              },
              description: data.value.slice(data.first, data.last).join(`\n`),
            }),
          ];
        },
      });
    };

    if (interaction.options.getSubcommand(false) === 'add') {

      let user: User = interaction.options.getUser('user');
      let reason: string = interaction.options.getString('reason');

      if (user.id === interaction.user.id) return await interaction.errorReply({ content: `This process cannot be performed on you.` });
      if (user.id === client.user.id) return await interaction.errorReply({ content: `This process cannot be performed on the bot.` });
      if (Data.Developers.some((developer: { id: string; }) => developer.id === user.id)) return await interaction.errorReply({ content: `This process cannot be performed on the developer.` });
      if (reason && reason.length > 100) return await interaction.errorReply({ content: `Reason length cannot exceed \`100\` characters.` });
      if (await data(user.id)) return await interaction.errorReply({ content: `The user is already blacklisted.` });

      await new Blacklist({ user: user.id, reason: reason ? ctx.case.filter(reason) : ``, addedTimestamp: new Date() }).save();

      await interaction.successReply({
        ephemeral: true,
        content: `${reason ? `${user.link(true)} has been added to the blacklist due to \`${ctx.case.filter(reason)}\`.` : `${user.link(true)} has been added to the blacklist.`}`,
      });
    };

    if (interaction.options.getSubcommand(false) === 'remove') {

      let user: User = interaction.options.getUser('user');

      if (!await data(user.id)) return await interaction.errorReply({ content: `The user is not already blacklisted.` });

      (await data(user.id)).deleteOne();

      await interaction.successReply({
        ephemeral: true,
        content: `${user.link(true)} has been removed from the blacklist.`,
      });
    };
  };
};