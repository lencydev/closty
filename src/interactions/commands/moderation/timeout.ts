import { Command } from 'Command';

import {
  User,
  GuildMember,
} from 'Root';

export default class extends Command {

  constructor () {
    super({
      name: 'timeout',
      options: [
        {
          name: 'add',
          description: 'Adds timeout to the member on the server.',
          type: 1,
          options: [
            {
              name: 'member',
              description: 'Member tag or identity.',
              type: 6,
              required: true,
            },
            {
              name: 'duration',
              description: 'Timeout duration length.',
              type: 3,
              required: true,
            },
            {
              name: 'reason',
              description: 'Reason for timeout.',
              type: 3,
              minLength: 2,
              maxLength: 100,
              required: false,
            },
          ],
        },
        {
          name: 'remove',
          description: 'Removes the member\'s timeout on the server.',
          type: 1,
          options: [
            {
              name: 'member',
              description: 'Member tag or identity.',
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
        executor: [ 'ModerateMembers' ],
        client: [ 'Administrator' ],
      },

      enabled: true,
    });
  };

  async execute ({ interaction }: { interaction: CommandInteraction; }): Execute {

    let executor: GuildMember = interaction.guild.members.cache.get(interaction.user.id);

    if (interaction.options.getSubcommand(false) === 'add') {

      let user: User = interaction.options.getUser('member');
      let member: GuildMember = interaction.guild.members.cache.get(user.id);
      let duration: string = interaction.options.getString('duration');
      let reason: string = interaction.options.getString('reason');

      if (!member) return await interaction.errorReply({ content: `The command can only be used on members.` });
      if (interaction.user.id === user.id) return await interaction.errorReply({ content: `This process cannot be performed on you.` });
      if (client.user.id === user.id) return await interaction.errorReply({ content: `This process cannot be performed on the bot.` });
      if (member.communicationDisabledUntilTimestamp) return await interaction.errorReply({ content: `The user is already muted.` });
      if (!member.permissions.has('ModerateMembers') && member.roles.highest.position >= executor.roles.highest.position) return await interaction.errorReply({ content: `You cannot access the user to be processed.` });
      if (member.permissions.has('ModerateMembers') || member.roles.highest.position >= interaction.guild.members.me.roles.highest.position) return await interaction.errorReply({ content: `The user to be process cannot be accessed.` });

      if (!ctx.case.time(duration)) return await interaction.errorReply({ content: `The duration value does not match the format.` });
      if (ctx.case.time('10s') > ctx.case.time(duration)) return await interaction.errorReply({ content: `Duration cannot be less than ${ctx.case.timeformat(ctx.case.time('10s'), { long: true })}.` });
      if (ctx.case.time('28d') < ctx.case.time(duration)) return await interaction.errorReply({ content: `Duration cannot exceed ${ctx.case.timeformat(ctx.case.time('28d'), { long: true })}.` });

      await member.timeout(ctx.case.time(duration), reason ? ctx.case.filter(reason) : null);

      await interaction.successReply({ content: `${reason ? `${user} has been muted on the server for \`${ctx.case.timeformat(ctx.case.time(duration), { long: true })}\` due to \`${ctx.case.filter(reason)}\`.` : `${user} has been muted on the server for \`${ctx.case.timeformat(ctx.case.time(duration), { long: true })}\`.` }` });
    };

    if (interaction.options.getSubcommand(false) === 'remove') {

      let user: User = interaction.options.getUser('member');
      let member: GuildMember = interaction.guild.members.cache.get(user.id);

      if (!member) return await interaction.errorReply({ content: `The command can only be used on members.` });
      if (interaction.user.id === user.id) return await interaction.errorReply({ content: `This process cannot be performed on you.` });
      if (client.user.id === user.id) return await interaction.errorReply({ content: `This process cannot be performed on the bot.` });
      if (!member.communicationDisabledUntilTimestamp) return await interaction.errorReply({ content: `The user is not already muted.` });

      await member.timeout(null);

      await interaction.successReply({ content: `${user} has been unmuted on the server.` });
    };
  };
};