import { Command } from 'Command';

import {
  User,
  GuildMember,
} from 'Root';

export default class extends Command {

  constructor () {
    super({
      name: 'kick',
      description: 'Kicks member from the server.',
      options: [
        {
          name: 'member',
          description: 'Member tag or identity.',
          type: 6,
          required: true,
        },
        {
          name: 'reason',
          description: 'Reason for kick.',
          type: 3,
          required: false,
        },
      ],

      cooldown: { time: '5s', global: false },

      category: 'moderation',

      developerOnly: false,
      ownerOnly: false,
      permissions: {
        executor: [ 'KickMembers' ],
        client: [ 'Administrator' ],
      },

      enabled: true,
    });
  };

  async execute ({ interaction }: { interaction: CommandInteraction; }): Execute {

    let executor: GuildMember = interaction.guild.members.cache.get(interaction.user.id);

    let user: User = interaction.options.getUser('member');
    let member: GuildMember = interaction.guild.members.cache.get(user.id);
    let reason: string = interaction.options.getString('reason');

    if (!member) return await interaction.errorReply({ content: `The command can only be used on members.` });
    if (interaction.user.id === user.id) return await interaction.errorReply({ content: `This process cannot be performed on you.` });
    if (client.user.id === user.id) return await interaction.errorReply({ content: `This process cannot be performed on the bot.` });
    if (!member.permissions.has('KickMembers') && member.roles.highest.position >= executor.roles.highest.position) return await interaction.errorReply({ content: `You cannot access the user to be processed.` });
    if (member.permissions.has('KickMembers') || member.roles.highest.position >= interaction.guild.members.me.roles.highest.position) return await interaction.errorReply({ content: `The user to be process cannot be accessed.` });

    await interaction.guild.members.kick(user.id, reason ? ctx.case.filter(reason) : null);

    await interaction.successReply({ content: `${reason ? `${user.link(true)} has been kicked from the server due to \`${ctx.case.filter(reason)}\`.` : `${user.link(true)} has been kicked from the server.` }` });
  };
};