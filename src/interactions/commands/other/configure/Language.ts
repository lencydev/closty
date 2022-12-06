import { Command } from 'Command';
import { Category } from 'Category';

import { Language } from 'Schemas';

import {
  Embed,
  ActionRow,
  StringSelectMenu,
  Button,
  InteractionCollector,
  ComponentType,
  PermissionsString,
} from 'Root';

export default class extends Category {

  constructor () {
    super({
      ownerOnly: false,
      permissions: {
        executor: [ 'Administrator' ],
        client: [ 'Administrator' ],
      },

      enabled: true,
    });
  };

  async execute ({ interaction }: { interaction: CommandInteraction; }): Execute {

    let languages: { [index in string]: { flag: string; language: string; }; } = {
      'en-US': { flag: `🇺🇸`, language: `English, US` },
      'tr': { flag: `🇹🇷`, language: `Turkish (Türkçe)` },
    };

    let data = async (): Promise<SchemaType<LanguageSchema>> => await Language.findOne({ guild: interaction.guild.id });

    if (!await data()) await new Language({ guild: interaction.guild.id }).save();

    async function embed (): Promise<Embed[]> {

      return [
        new Embed({
          color: Color.Default,
          thumbnail: {
            url: interaction.guild.icon ? interaction.guild.iconURL({ forceStatic: false, size: 512, extension: `png` }) : 'https://cdn.discordapp.com/attachments/997192404694204506/1024659802569330719/blank.png',
          },
          author: {
            name: await translate('configure.language.title', interaction.guild),
            iconURL: client.user.displayAvatarURL(),
            url: Data.InviteURL,
          },
          description: await translate('configure.language.description', interaction.guild),
        }),
      ];
    };

    async function components (): Promise<Array<ActionRow<ActionRowComponent>>> {

      let components: Array<ActionRow<ActionRowComponent>> = [];

      return [
        new ActionRow<ActionRowComponent>({
          components: [
            new StringSelectMenu({
              customId: `list`,
              disabled: false,
              options: await Promise.all(client.languages.map(async (language: string) => {
                return {
                  default: language === (await data()).language,
                  emoji: { name: languages[language].flag },
                  label: languages[language].language,
                  value: language,
                };
              })),
            }),
          ],
        }),
        ...components,
        new ActionRow<ActionRowComponent>({
          components: [
            new Button({ style: 4, emoji: { id: Emoji.Button.Back }, customId: `back` }),
          ],
        }),
      ];
    };

    async function Return (i: StringSelectMenuInteraction | ButtonInteraction, content: string | string[], edit?: boolean): Promise<void> {

      await i.deferUpdate();

      await i.errorReply({ content });

      if (edit) await interaction.editReply({ embeds: await embed(), components: await components() }); return;
    };

    let message: Message = await interaction.editReply({ embeds: await embed(), components: await components() });

    let listCollector: InteractionCollector<StringSelectMenuInteraction> = message.createMessageComponentCollector({ componentType: ComponentType.StringSelect, filter: (select_menu: StringSelectMenuInteraction) => select_menu.customId === 'list' });
    let buttonCollector: InteractionCollector<ButtonInteraction> = message.createMessageComponentCollector({ componentType: ComponentType.Button });

    listCollector.on('collect', async (select_menu: StringSelectMenuInteraction) => {

      let [ value ]: string[] = select_menu.values;

      if (interaction.user.id !== select_menu.user.id) return await Return(select_menu, `You cannot use this select menu.`);
      if (this.permissions && this.permissions.executor && !interaction.guild.members.cache.get(interaction.user.id).permissions.has(this.permissions.executor)) return await Return(select_menu, `You must have ${ctx.case.formattedMap(this.permissions.executor, { format: (value: PermissionsString) => `\`${ctx.case.permission(value)}\`` })} permission${(this.permissions.executor).length === 1 ? `` : `s`} to use the command.`);
      if (this.permissions && this.permissions.client && !interaction.guild.members.me.permissions.has(this.permissions.client)) return await Return(select_menu, `I need ${ctx.case.formattedMap(this.permissions.client, { format: (value: PermissionsString) => `\`${ctx.case.permission(value)}\`` })} permission${(this.permissions.client).length === 1 ? `` : `s`}.`);

      await Language.findOneAndUpdate({ guild: interaction.guild.id }, { $set: { language: value } }, { upsert: true });

      await interaction.editReply({ embeds: await embed(), components: await components() });

      await select_menu.deferUpdate();
    });

    buttonCollector.on('collect', async (button: ButtonInteraction) => {

      if (interaction.user.id !== button.user.id) return await Return(button, `You cannot use this button.`);
      if (this.permissions && this.permissions.executor && !interaction.guild.members.cache.get(interaction.user.id).permissions.has(this.permissions.executor)) return await Return(button, `You must have ${ctx.case.formattedMap(this.permissions.executor, { format: (value: PermissionsString) => `\`${ctx.case.permission(value)}\`` })} permission${(this.permissions.executor).length === 1 ? `` : `s`} to use the command.`);
      if (this.permissions && this.permissions.client && !interaction.guild.members.me.permissions.has(this.permissions.client)) return await Return(button, `I need ${ctx.case.formattedMap(this.permissions.client, { format: (value: PermissionsString) => `\`${ctx.case.permission(value)}\`` })} permission${(this.permissions.client).length === 1 ? `` : `s`}.`);

      let id: string = button.customId;

      if (id === 'back') {

        let configure: Command = new (await import(`../configure`)).default;

        await configure.execute({ interaction });

        listCollector.stop();
        buttonCollector.stop();

        await button.deferUpdate(); return;
      };

      await interaction.editReply({ embeds: await embed(), components: await components() });

      await button.deferUpdate();
    });
  };
};