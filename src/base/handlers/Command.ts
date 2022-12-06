import { Handler } from 'Handler';

import { Command } from 'Command';

import { Blacklist } from 'Schemas';

import {
  Interaction,
  Embed,
  PermissionsString,
} from 'Root';

export default class extends Handler {

  constructor () {
    super({
      type: 'interactionCreate',
      enabled: true,
    });
  };

  async execute (interaction: Interaction): Promise<any> {

    if (interaction.isChatInputCommand()) {

      let command: Command = client.commands.get(interaction.commandName);

      try {

        if (!interaction.guild.roles.everyone.permissionsIn(interaction.channel.id).has(`UseExternalEmojis`)) return await interaction.reply({ ephemeral: true, content: `⚠️ The channel where the command is used must have the \`Use External Emojis\` permission turned on in the ${interaction.guild.roles.everyone} role.` });

        if (command.developerOnly && !Data.Developers.some((developer: typeof Data['Developers'][0]) => developer.id === interaction.user.id)) return await interaction.errorReply({ content: `The command can only be used by the developer.` });
        if (command.ownerOnly && interaction.user.id !== interaction.guild.ownerId) return await interaction.errorReply({ content: `The command can only be used by the server owner.` });

        if (command.permissions && command.permissions.executor && !interaction.guild.members.cache.get(interaction.user.id).permissions.has(command.permissions.executor)) return await interaction.errorReply({ content: `You must have ${ctx.case.formattedMap(command.permissions.executor, { format: (value: PermissionsString) => `\`${ctx.case.permission(value)}\`` })} permission${(command.permissions.executor).length === 1 ? `` : `s`} to use the command.` });
        if (command.permissions && command.permissions.client && !interaction.guild.members.me.permissions.has(command.permissions.client)) return await interaction.errorReply({ content: `I need ${ctx.case.formattedMap(command.permissions.client, { format: (value: PermissionsString) => `\`${ctx.case.permission(value)}\`` })} permission${(command.permissions.client).length === 1 ? `` : `s`}.` });

        if (await Blacklist.findOne({ user: interaction.user.id })) return await interaction.errorReply({ content: `You can't use commands because you found it on the blacklist.` });

        if (client.cooldowns.command.has(`${interaction.user.id}_${interaction.command.id}`)) return await interaction.errorReply({ content: `The command can be used again after \`${ctx.case.timeformat(client.cooldowns.command.get(`${interaction.user.id}_${interaction.command.id}`) - Date.now(), { long: true })}\`.` });
        if (client.cooldowns.command.has(`${interaction.guild.id}_${interaction.user.id}_${interaction.command.id}`)) return await interaction.errorReply({ content: `The command can be used again after \`${ctx.case.timeformat(client.cooldowns.command.get(`${interaction.guild.id}_${interaction.user.id}_${interaction.command.id}`) - Date.now(), { long: true })}\`.` });

        logger.send(`Command Used: ${TextColor(interaction.commandName, '#F1F258')} by ${TextColor(`${interaction.user.tag} (${interaction.user.id})`, '#7E58F2`')}`, { type: 3 });

        await command.execute({ interaction });

      } catch (error: any) {

        logger.send(`${error}`, { type: 2 });

        await interaction.errorReply({ content: `Something went wrong...` });

        await client.users.cache.get(Data.Developers[0].id).send({
          embeds: [
            new Embed({
              color: Color.Default,
              fields: [
                { name: `Exucator`, value: `${interaction.user} (\`${interaction.user.id}\`)`, inline: true },
                { name: `Command`, value: `\`${command.name}\``, inline: true },
                { name: `Error`, value: `\`\`\`ts\n${error.length > 1000 ? `${error.slice(0, 1000)}...` : `${error}`}\n\`\`\``, inline: false },
              ],
            }),
          ],
        });
      };

      if (command.cooldown && !Data.Developers.some((developer: typeof Data['Developers'][0]) => developer.id === interaction.user.id)) {

        if (command.cooldown.global) {

          client.cooldowns.command.set(`${interaction.user.id}_${interaction.command.id}`, Date.now() + ctx.case.time(command.cooldown.time));

          setTimeout(() => client.cooldowns.command.delete(`${interaction.user.id}_${interaction.command.id}`), ctx.case.time(command.cooldown.time));
        };

        if (!command.cooldown.global) {

          client.cooldowns.command.set(`${interaction.guild.id}_${interaction.user.id}_${interaction.command.id}`, Date.now() + ctx.case.time(command.cooldown.time));

          setTimeout(() => client.cooldowns.command.delete(`${interaction.guild.id}_${interaction.user.id}_${interaction.command.id}`), ctx.case.time(command.cooldown.time));
        };
      };
    };
  };
};