import { Command } from 'Command';

import {
  Collection,
  User,
  GuildMember,
  GuildBan,
} from 'Root';

export default class extends Command {

  constructor () {
    super({
      name: 'ban',
      options: [
        {
          name: 'add',
          description: 'Bans user from the server.',
          type: 1,
          options: [
            {
              name: 'user',
              description: 'User tag or identity.',
              type: 6,
              required: true,
            },
            {
              name: 'purge-messages',
              description: 'Delete message history.',
              type: 10,
              required: false,
              choices: [
                { name: 'Don\'t Delete Anything', value: 0 },
                { name: 'Previous 24 Hours', value: 1 },
                { name: 'Previous 2 Days', value: 2 },
                { name: 'Previous 3 Days', value: 3 },
                { name: 'Previous 4 Days', value: 4 },
                { name: 'Previous 5 Days', value: 5 },
                { name: 'Previous 6 Days', value: 6 },
                { name: 'Previous 7 Days', value: 7 },
              ],
            },
            {
              name: 'reason',
              description: 'Reason for ban.',
              type: 3,
              minLength: 2,
              maxLength: 100,
              required: false,
            },
          ],
        },
        {
          name: 'remove',
          description: 'Removes the user\'s ban from the server.',
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

      cooldown: { time: '5s', global: false },

      category: 'moderation',

      developerOnly: false,
      ownerOnly: false,
      permissions: {
        executor: [ 'BanMembers' ],
        client: [ 'Administrator' ],
      },

      enabled: true,
    });
  };

  async execute ({ interaction }: { interaction: CommandInteraction; }): Execute {

    let executor: GuildMember = interaction.guild.members.cache.get(interaction.user.id);

    if (interaction.options.getSubcommand(false) === 'add') {

      let user: User = interaction.options.getUser('user');
      let member: GuildMember = interaction.guild.members.cache.get(user.id);
      let purgeMessages: number = interaction.options.getNumber('time');
      let reason: string = interaction.options.getString('reason');

      if (interaction.user.id === user.id) return await interaction.errorReply({ content: `This process cannot be performed on you.` });
      if (client.user.id === user.id) return await interaction.errorReply({ content: `This process cannot be performed on the bot.` });
      if (await interaction.guild.bans.fetch().then((banneds: Collection<string, GuildBan>) => banneds.find((banned: GuildBan) => banned.user.id === user.id))) await interaction.errorReply({ content: `The user is already banned.` });

      if (member) {
        if (!member.permissions.has('BanMembers') && member.roles.highest.position >= executor.roles.highest.position) return await interaction.errorReply({ content: `You cannot access the user to be processed.` });
        if (member.permissions.has('BanMembers') || member.roles.highest.position >= interaction.guild.members.me.roles.highest.position) return await interaction.errorReply({ content: `The user to be process cannot be accessed.` });
      };

      await interaction.guild.members.ban(user.id, { deleteMessageDays: purgeMessages || 0, reason: reason ? ctx.case.filter(reason) : null });

      await interaction.successReply({ content: `${reason ? `${user.link(true)} has been banned from the server due to \`${ctx.case.filter(reason)}\`.` : `${user.link(true)} has been banned from the server.` }` });
    };

    if (interaction.options.getSubcommand(false) === 'remove') {

      let user: User = interaction.options.getUser('user');

      if (interaction.user.id === user.id) return await interaction.errorReply({ content: `This process cannot be performed on you.` });
      if (client.user.id === user.id) return await interaction.errorReply({ content: `This process cannot be performed on the bot.` });
      if (!await interaction.guild.bans.fetch().then((banneds: Collection<string, GuildBan>) => banneds.find((banned: GuildBan) => banned.user.id === user.id))) await interaction.errorReply({ content: `The user is not already banned.` });

      await interaction.guild.members.unban(user.id);

      await interaction.successReply({ content: `${user.link(true)} has been unbanned from the server.` });
    };
  };
};