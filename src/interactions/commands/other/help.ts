import { Command } from 'Command';

import {
  Embed,
  ApplicationCommand,
  ApplicationCommandOptionData,
  ApplicationCommandSubCommandData,
  parseEmoji,
} from 'Root';

type Category = { emoji: string; label: string; commands: string[]; };

export default class extends Command {

  constructor () {
    super({
      name: 'help',
      description: 'Shows all commands.',
      options: [
        {
          name: 'ephemeral',
          description: 'Ephemeral response.',
          type: 5,
          required: false,
        },
      ],

      cooldown: { time: '10s', global: false },

      developerOnly: false,
      ownerOnly: false,
      permissions: false,

      enabled: true,
    });
  };

  async execute ({ interaction }: { interaction: CommandInteraction; }): Execute {

    let ephemeral: boolean = interaction.options.getBoolean('ephemeral');

    let icons: { [index: string]: string; } = {
      developer: parseEmoji(Emoji.Utils.New).id,
      information: parseEmoji(Emoji.Utils.New).id,
      moderation: parseEmoji(Emoji.Utils.New).id,
    };

    let categories: Category[] = await Promise.all([ ...new Set(client.commands.map((command: Command) => command.category)) ].filter((category: CommandCategories) => category !== 'other').map(async (category: CommandCategories) => {

      let commands: string[] = [];

      await Promise.all(client.application.commands.cache.filter((i: ApplicationCommand) => i.type === 1).filter((i: ApplicationCommand) => client.commands.get(i.name).category === category).map((command: ApplicationCommand) => {

        if (command.options && command.options.length) {

          if (command.options.find((option: ApplicationCommandOptionData) => option.type === 1 || option.type === 2)) command.options.map((option: ApplicationCommandOptionData) => {
            if (option.type === 1) return commands.push(`</${command.name} ${option.name}:${command.id}> ${option.options && option.options.length ? option.options.map((option: any) => option.required ? `\`<${option.name}>\`` : `\`[${option.name}]\``).join(` `) : ``}`);
            if (option.type === 2) return option.options.map((subCommand: ApplicationCommandSubCommandData) => commands.push(`</${command.name} ${option.name} ${subCommand.name}:${command.id}> ${subCommand.options && subCommand.options.length ? subCommand.options.map((option: any) => option.required ? `\`<${option.name}>\`` : `\`[${option.name}]\``).join(` `) : ``}`));
          });

          if (command.options.find((option: ApplicationCommandOptionData) => option.type !== 1 && option.type !== 2)) commands.push(`</${command.name}:${command.id}> ${command.options.map((option: ApplicationCommandOptionData) => {
            if (option.type !== 1 && option.type !== 2) return `${option.required ? `\`<${option.name}>\`` : `\`[${option.name}]\``}`;
          }).join(` `)}`);
        } else return commands.push(`</${command.name}:${command.id}>`);
      }));

      return {
        emoji: icons[category],
        label: ctx.case.title(category),
        commands: commands,
      };
    }));

    await ctx.menu.paginate(interaction, {
      ephemeral,
      pageSize: 10,
      menus: async () => [
        {
          label: `Getting Started`,
          value: [
            new Embed({
              color: Color.Default,
              author: {
                name: `Help`,
                iconURL: client.user.displayAvatarURL(),
                url: Data.InviteURL,
              },
              thumbnail: {
                url: client.user.displayAvatarURL({ forceStatic: false, size: 512, extension: `png` }),
              },
              title: `Getting Started`,
              description: [
                `${Emoji.Info} Closty is an open source project.`,
              ].join(`\n`),
            }),
          ],
          links: [
            { emoji: parseEmoji(Emoji.SupportServer).id, label: `Support Server`, url: Data.SupportServer.InviteURL },
            { emoji: parseEmoji(Emoji.AddToServer).id, label: `Add to Server`, url: Data.InviteURL },
            { emoji: parseEmoji(Emoji.Github).id, label: `Source Code`, url: Data.SourceURL },
          ],
        },
        ...await Promise.all(categories.map(async (category: Category) => {
          return {
            emoji: category.emoji,
            label: `${category.label} (${ctx.case.number(category.commands.length)})`,
            value: await Promise.all(category.commands.map((command: string) => command)),
          };
        })),
      ],
      embeds: async (data: Parameters<PaginateOptions['embeds']>[0]) => {
        return [
          new Embed({
            color: Color.Default,
            author: {
              name: `Help`,
              iconURL: client.user.displayAvatarURL(),
              url: Data.InviteURL,
            },
            thumbnail: {
              url: client.user.displayAvatarURL({ forceStatic: false, size: 512, extension: `png` }),
            },
            title: `${data.emoji} ${data.label}`,
            description: data.value.slice(data.first, data.last).join(`\n`),
          }),
        ];
      },
    });
  };
};