import { Command } from 'Command';
import { Category } from 'Category';

import {
  Embed,
  ActionRow,
  StringSelectMenu,
  Button,
  InteractionCollector,
  ComponentType,
  PermissionsString,
  parseEmoji,
} from 'Root';

export default class extends Command {

  constructor () {
    super({
      name: 'configure',
      description: `Server configurations.`,
      options: [
        {
          name: 'ephemeral',
          description: 'Ephemeral response.',
          type: 5,
          required: false,
        },
      ],

      cooldown: false,

      developerOnly: false,
      ownerOnly: false,
      permissions: {
        executor: [ 'Administrator' ],
        client: [ 'Administrator' ],
      },

      enabled: true,
    });
  };

  async execute ({ interaction }: { interaction: CommandInteraction; }): Execute {

    let ephemeral: boolean = interaction.options.getBoolean('ephemeral');

    let configurations: { [index in string]: { emoji: string; label: string; description: string; } } = {
      Autorole: { emoji: Emoji.Autorole, label: await translate('configure.autorole.menu.title', interaction.guild), description: await translate('configure.autorole.menu.description', interaction.guild) },
      Language: { emoji: Emoji.Language, label: await translate('configure.language.menu.title', interaction.guild), description: await translate('configure.language.menu.description', interaction.guild) },
    };

    let categories: string[] = load('./interactions/commands/other/configure/*.{ts,js}');

    async function embed (): Promise<Embed[]> {

      return [
        new Embed({
          color: Color.Default,
          thumbnail: {
            url: interaction.guild.icon ? interaction.guild.iconURL({ forceStatic: false, size: 512, extension: `png` }) : 'https://cdn.discordapp.com/attachments/997192404694204506/1024659802569330719/blank.png',
          },
          author: {
            name: await translate('configure.title', interaction.guild),
            iconURL: client.user.displayAvatarURL(),
            url: Data.InviteURL,
          },
          description: await translate('configure.description', interaction.guild),
        }),
      ];
    };

    async function components (): Promise<Array<ActionRow<ActionRowComponent>>> {

      let components: Array<ActionRow<ActionRowComponent>> = [];

      if (!ephemeral) {

        components = [
          ...components,
          new ActionRow<ActionRowComponent>({
            components: [
              new Button({ style: 4, emoji: { id: Emoji.Button.Delete }, customId: `delete` }),
            ],
          }),
        ];
      };

      return [
        new ActionRow<ActionRowComponent>({
          components: [
            new StringSelectMenu({
              customId: `configure`,
              placeholder: await translate('configure.placeholder', interaction.guild),
              disabled: false,
              options: await Promise.all(categories.map(async (file: string) => {

                let configuration: string = file.split(`configure/`)[1].split(`.`)[0];

                return {
                  emoji: { id: parseEmoji(configurations[configuration].emoji).id },
                  label: configurations[configuration].label,
                  description: configurations[configuration].description,
                  value: configuration,
                };
              })),
            }),
          ],
        }),
        ...components,
      ];
    };

    async function Return (i: StringSelectMenuInteraction | ButtonInteraction, content: string | string[], edit?: boolean): Promise<void> {

      await i.deferUpdate();

      await i.errorReply({ content });

      if (edit) await interaction.editReply({ embeds: await embed(), components: await components() }); return;
    };

    let message: Message;

    if (interaction.replied) message = await interaction.editReply({ embeds: await embed(), components: await components() });
    else if (interaction.deferred) message = await interaction.followUp({ embeds: await embed(), components: await components() });
    else message = await interaction.reply({ ephemeral, embeds: await embed(), components: await components(), fetchReply: true });

    let listCollector: InteractionCollector<StringSelectMenuInteraction> = message.createMessageComponentCollector({ componentType: ComponentType.StringSelect, filter: (select_menu: StringSelectMenuInteraction) => select_menu.customId === 'configure' });
    let buttonCollector: InteractionCollector<ButtonInteraction> = message.createMessageComponentCollector({ componentType: ComponentType.Button });

    listCollector.on('collect', async (select_menu: StringSelectMenuInteraction) => {

      if (interaction.user.id !== select_menu.user.id) return await Return(select_menu, `You cannot use this select menu.`);

      let [ configuration ]: string[] = select_menu.values;

      let category: Category = new (await import(`./configure/${configuration}`)).default;

      if (category.ownerOnly && interaction.user.id !== interaction.guild.ownerId) return await interaction.errorReply({ content: `Category \`${configurations[configuration].label}\` can only be used by the server owner.` });

      if (category.permissions && category.permissions.executor && !interaction.guild.members.cache.get(interaction.user.id).permissions.has(category.permissions.executor)) return await Return(select_menu, `You must have ${ctx.case.formattedMap(category.permissions.executor, { format: (value: PermissionsString) => `\`${ctx.case.permission(value)}\`` })} permission${(category.permissions.executor).length === 1 ? `` : `s`} to use the command.`);
      if (category.permissions && category.permissions.client && !interaction.guild.members.me.permissions.has(category.permissions.client)) return await Return(select_menu, `I need ${ctx.case.formattedMap(category.permissions.client, { format: (value: PermissionsString) => `\`${ctx.case.permission(value)}\`` })} permission${(category.permissions.client).length === 1 ? `` : `s`}.`);

      if (!category.enabled) return await Return(select_menu, `Category \`${configurations[configuration].label}\` is currently unavailable.`, true);

      await category.execute({ interaction });

      listCollector.stop();
      buttonCollector.stop();

      await select_menu.deferUpdate();
    });

    buttonCollector.on('collect', async (button: ButtonInteraction) => {

      if (interaction.user.id !== button.user.id) return await Return(button, `You cannot use this button.`);
      if (this.permissions && this.permissions.executor && !interaction.guild.members.cache.get(interaction.user.id).permissions.has(this.permissions.executor)) return await Return(button, `You must have ${ctx.case.formattedMap(this.permissions.executor, { format: (value: PermissionsString) => `\`${ctx.case.permission(value)}\`` })} permission${(this.permissions.executor).length === 1 ? `` : `s`} to use the command.`);
      if (this.permissions && this.permissions.client && !interaction.guild.members.me.permissions.has(this.permissions.client)) return await Return(button, `I need ${ctx.case.formattedMap(this.permissions.client, { format: (value: PermissionsString) => `\`${ctx.case.permission(value)}\`` })} permission${(this.permissions.client).length === 1 ? `` : `s`}.`);

      let id: string = button.customId;

      if (id === 'delete') return await interaction.deleteReply();
    });
  };
};