import { Command } from 'Command';

import { totalmem, freemem } from 'os';
import { cpu } from 'node-os-utils';

import {
  Embed,
  parseEmoji,
} from 'Root';

export default class extends Command {

  constructor () {
    super({
      name: 'stats',
      description: 'Shows the bot\'s statistics.',
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

    let memory: { [index in 'used' | 'total']: number; } = {
      used: Math.round((totalmem() - freemem()) / 1024 / 1024),
      total: Math.round(totalmem() / 1024 / 1024),
    };

    await ctx.menu.paginate(interaction, {
      ephemeral,
      menus: async () => [
        {
          value: [
            new Embed({
              color: Color.Default,
              thumbnail: {
                url: client.user.displayAvatarURL({ forceStatic: false, size: 512, extension: `png` }),
              },
              author: {
                name: `${client.user.username} Statistics`,
                iconURL: client.user.displayAvatarURL(),
                url: Data.InviteURL,
              },
              title: `${client.user.username} (v${require('../../../../package.json').version})`,
              url: Data.InviteURL,
              fields: [
                { name: `Creation Date`, value: (client.user.createdTimestamp).toUnix(), inline: true },
                { name: `Servers`, value: `${ctx.case.number(client.guilds.cache.size)}`, inline: true },
                { name: `\u200B`, value: `\u200B`, inline: true },
                { name: `API Latency`, value: `${client.ws.ping} ms`, inline: true },
                { name: `Reply Latency`, value: `${Math.abs(Date.now() - interaction.createdTimestamp)} ms`, inline: true },
                { name: `\u200B`, value: `\u200B`, inline: true },
                { name: `Developers`, value: `${Data.Developers.map((developer: any) => `${client.users.cache.get(developer.id).link(true)}`).join(`\n`)}`, inline: true },
                { name: `Library`, value: `[Discord.js](https://discord.js.org 'v${require('discord.js').version}') ([TypeScript](https://www.typescriptlang.org 'v${require('typescript').version}'))`, inline: true },
                { name: `\u200B`, value: `\u200B`, inline: true },
                { name: `Memory Usage`, value: `${ctx.util.progressBar(memory.used, memory.total)} \`${((memory.used * 100) / memory.total).toFixed(0)}%\``, inline: true },
                { name: `Processor Usage`, value: `${await cpu.usage().then((percent: number) => `${ctx.util.progressBar(Number(percent.toFixed(0)), 100)} \`${percent.toFixed(0)}%\``)}`, inline: true },
                { name: `\u200B`, value: `\u200B`, inline: true },
                { name: `Uptime`, value: `${(client.readyTimestamp).toUnix('F')} (${(client.readyTimestamp).toUnix('R')})`, inline: false },
              ],
            }),
          ],
          links: [
            { emoji: parseEmoji(Emoji.SupportServer).id, label: `Support Server`, url: Data.SupportServer.InviteURL },
            { emoji: parseEmoji(Emoji.AddToServer).id, label: `Add to Server`, url: Data.InviteURL },
            { emoji: parseEmoji(Emoji.Github).id, label: `Source Code`, url: Data.SourceURL },
          ],
        },
      ],
    });
  };
};