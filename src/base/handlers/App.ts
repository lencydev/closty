import { Handler } from 'Handler';

import { App } from 'App';

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

    if (interaction.isContextMenuCommand()) {

      let app: App = client.apps.get(interaction.commandName);

      try {

        if (!interaction.guild.roles.everyone.permissionsIn(interaction.channel.id).has(`UseExternalEmojis`)) return await interaction.reply({ ephemeral: true, content: `⚠️ The channel where the app is used must have the \`Use External Emojis\` permission turned on in the ${interaction.guild.roles.everyone} role.` });

        if (app.developerOnly && !Data.Developers.some((developer: typeof Data['Developers'][0]) => developer.id === interaction.user.id)) return await interaction.errorReply({ content: `The command can only be used by the developer.` });
        if (app.ownerOnly && interaction.user.id !== interaction.guild.ownerId) return await interaction.errorReply({ content: `The command can only be used by the server owner.` });

        if (app.permissions && app.permissions.executor && !interaction.guild.members.cache.get(interaction.user.id).permissions.has(app.permissions.executor)) return await interaction.errorReply({ content: `You must have ${ctx.case.formattedMap(app.permissions.executor, { format: (value: PermissionsString) => `\`${ctx.case.permission(value)}\`` })} permission${(app.permissions.executor).length === 1 ? `` : `s`} to use the app.` });
        if (app.permissions && app.permissions.client && !interaction.guild.members.me.permissions.has(app.permissions.client)) return await interaction.errorReply({ content: `I need ${ctx.case.formattedMap(app.permissions.client, { format: (value: PermissionsString) => `\`${ctx.case.permission(value)}\`` })} permission${(app.permissions.client).length === 1 ? `` : `s`}.` });

        if (await Blacklist.findOne({ user: interaction.user.id })) return await interaction.errorReply({ content: `You can't use apps because you found it on the blacklist.` });

        if (client.cooldowns.app.has(`${interaction.user.id}_${interaction.command.id}`)) return await interaction.errorReply({ content: `The app can be used again after \`${ctx.case.timeformat(client.cooldowns.app.get(`${interaction.user.id}_${interaction.command.id}`) - Date.now(), { long: true })}\`.` });
        if (client.cooldowns.app.has(`${interaction.guild.id}_${interaction.user.id}_${interaction.command.id}`)) return await interaction.errorReply({ content: `The app can be used again after \`${ctx.case.timeformat(client.cooldowns.app.get(`${interaction.guild.id}_${interaction.user.id}_${interaction.command.id}`) - Date.now(), { long: true })}\`.` });

        logger.send(`App Used: ${TextColor(interaction.commandName, '#F1F258')} by ${TextColor(`${interaction.user.tag} (${interaction.user.id})`, '#7E58F2`')}`, { type: 3 });

        await app.execute({ interaction });

      } catch (error: any) {

        logger.send(`${error}`, { type: 2 });

        await interaction.errorReply({ content: `Something went wrong...` });

        await client.users.cache.get(Data.Developers[0].id).send({
          embeds: [
            new Embed({
              color: Color.Default,
              fields: [
                { name: `Exucator`, value: `${interaction.user} (\`${interaction.user.id}\`)`, inline: true },
                { name: `App`, value: `\`${app.name}\``, inline: true },
                { name: `Error`, value: `\`\`\`ts\n${error.length > 1000 ? `${error.slice(0, 1000)}...` : `${error}`}\n\`\`\``, inline: false },
              ],
            }),
          ],
        });
      };

      if (app.cooldown && !Data.Developers.some((developer: typeof Data['Developers'][0]) => developer.id === interaction.user.id)) {

        if (app.cooldown.global) {

          client.cooldowns.app.set(`${interaction.user.id}_${interaction.command.id}`, Date.now() + ctx.case.time(app.cooldown.time));

          setTimeout(() => client.cooldowns.app.delete(`${interaction.user.id}_${interaction.command.id}`), ctx.case.time(app.cooldown.time));
        };

        if (!app.cooldown.global) {

          client.cooldowns.app.set(`${interaction.guild.id}_${interaction.user.id}_${interaction.command.id}`, Date.now() + ctx.case.time(app.cooldown.time));

          setTimeout(() => client.cooldowns.app.delete(`${interaction.guild.id}_${interaction.user.id}_${interaction.command.id}`), ctx.case.time(app.cooldown.time));
        };
      };
    };
  };
};