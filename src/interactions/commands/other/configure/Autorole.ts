import { Command } from 'Command';
import { Category } from 'Category';

import { Autorole } from 'Schemas';

import {
  Embed,
  ActionRow,
  StringSelectMenu,
  Button,
  Modal,
  TextInput,
  InteractionCollector,
  ComponentType,
  PermissionsString,
  Role,
  parseEmoji,
} from 'Root';

type ButtonNames = 'previous' | 'next' | 'search';

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

    let data = async (): Promise<SchemaType<AutoroleSchema>> => await Autorole.findOne({ guild: interaction.guild.id });
    let values = (): Role[] => interaction.guild.roles.cache.map((role: Role) => role).sort((first: Role, last: Role) => last.position - first.position).filter((role: Role) => role.position < interaction.guild.members.me.roles.highest.position && role.id !== interaction.guild.roles.everyone.id && !role.managed);

    if (!await data()) await new Autorole({ guild: interaction.guild.id }).save();

    if ((await data()).roles.length) {

      if (!interaction.guild.members.me.permissions.has('Administrator')) return (await data()).deleteOne();

      await Promise.all((await data()).roles.map(async (id: string) => {

        if (!interaction.guild.roles.cache.has(id)) await Autorole.findOneAndUpdate({ guild: interaction.guild.id }, { $pull: { roles: id } }, { upsert: true });
        if (interaction.guild.roles.cache.get(id).position >= interaction.guild.members.me.roles.highest.position) await Autorole.findOneAndUpdate({ guild: interaction.guild.id }, { $pull: { roles: id } }, { upsert: true });
      }));
    };

    let pageSize: number = 25;

    let styles: { [index in ButtonNames]: number; } = {
      previous: 2,
      next: 2,
      search: 1,
    };

    let emojis: { [index in ButtonNames]: string; } = {
      previous: Emoji.Button.Previous,
      next: Emoji.Button.Next,
      search: Emoji.Button.Search,
    };

    let current: { [index in 'page' | 'first' | 'last']: number; } = {
      page: 1,
      first: 0,
      last: pageSize,
    };

    let pages: number = Math.ceil(values().length / pageSize);

    async function embed (): Promise<Embed[]> {

      return [
        new Embed({
          color: Color.Default,
          thumbnail: {
            url: interaction.guild.icon ? interaction.guild.iconURL({ forceStatic: false, size: 512, extension: `png` }) : 'https://cdn.discordapp.com/attachments/997192404694204506/1024659802569330719/blank.png',
          },
          author: {
            name: await translate('configure.autorole.title', interaction.guild),
            iconURL: client.user.displayAvatarURL(),
            url: Data.InviteURL,
          },
          description: await translate('configure.autorole.description', interaction.guild),
          fields: (await data()).roles.length ? [
            {
              name: `${await translate('global.roles', interaction.guild)} (${(await data()).roles.length}/3)`,
              value: `${(await data()).roles.sort((first: string, last: string) => interaction.guild.roles.cache.get(last).position - interaction.guild.roles.cache.get(first).position).map((roleId: string) => interaction.guild.roles.cache.get(roleId)).join(`, `)}`,
              inline: false,
            },
          ] : [],
        }),
      ];
    };

    function buttons (): Button[] {

      function checkPage (button: ButtonNames): boolean {

        if (([ 'previous' ] as ButtonNames[]).includes(button) && current.page <= 1) return true;
        if (([ 'next' ] as ButtonNames[]).includes(button) && current.page >= pages) return true;

        return false;
      };

      let buttons: ButtonNames[] = [];

      if (pages > 1) buttons = [ 'previous', 'next' ];
      if (pages > 2) buttons = [ ...buttons, 'search' ];

      return buttons.reduce((buttons: Button[], button: ButtonNames): Button[] => {

        buttons.push(new Button({ style: styles[button], emoji: { id: emojis[button] }, customId: button, disabled: checkPage(button) }));

        return buttons;
      }, []);
    };

    async function components (): Promise<Array<ActionRow<ActionRowComponent>>> {

      let components: Array<ActionRow<ActionRowComponent>> = [];

      if (buttons().length) {

        components = [
          ...components,
          new ActionRow<ActionRowComponent>({
            components: buttons(),
          }),
        ];
      };

      return [
        new ActionRow<ActionRowComponent>({
          components: [
            new StringSelectMenu({
              customId: `list`,
              placeholder: values().length ? `${!(await data()).roles.length ? await translate('configure.autorole.placeholder.1', interaction.guild) : await translate('configure.autorole.placeholder.2', interaction.guild)} ${pages > 1 ? `(${await translate('global.page', interaction.guild)}: ${current.page}/${pages})` : ``}` : await translate('configure.autorole.placeholder.3', interaction.guild),
              disabled: !values().length,
              options: !values().length ? [ { label: `undefined`, value: `undefined` } ] : await Promise.all(values().slice(current.first, current.last).map(async (role: Role) => {
                return {
                  emoji: { id: interaction.user.id === interaction.guild.ownerId || role.position < interaction.guild.members.cache.get(interaction.user.id).roles.highest.position ? (await data()).roles.includes(role.id) ? parseEmoji(Emoji.CircleSuccess).id : parseEmoji(Emoji.Circle).id : parseEmoji(Emoji.CircleError).id },
                  label: role.name,
                  description: interaction.user.id === interaction.guild.ownerId || role.position < interaction.guild.members.cache.get(interaction.user.id).roles.highest.position ? (await data()).roles.includes(role.id) ? await translate('configure.autorole.selection_description.1', interaction.guild) : undefined : await translate('configure.autorole.selection_description.2', interaction.guild),
                  value: role.id,
                };
              })),
            }),
          ],
        }),
        ...components,
        new ActionRow<ActionRowComponent>({
          components: [
            new Button({ style: 4, emoji: { id: Emoji.Button.Back }, customId: `back` }),
            new Button({ style: 4, emoji: { id: Emoji.Button.Reset }, customId: `reset`, disabled: !(await data()).roles.length }),
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

      if (interaction.user.id !== select_menu.user.id) return await Return(select_menu, `You cannot use this select menu.`);
      if (this.permissions && this.permissions.executor && !interaction.guild.members.cache.get(interaction.user.id).permissions.has(this.permissions.executor)) return await Return(select_menu, `You must have ${ctx.case.formattedMap(this.permissions.executor, { format: (value: PermissionsString) => `\`${ctx.case.permission(value)}\`` })} permission${(this.permissions.executor).length === 1 ? `` : `s`} to use the command.`);
      if (this.permissions && this.permissions.client && !interaction.guild.members.me.permissions.has(this.permissions.client)) return await Return(select_menu, `I need ${ctx.case.formattedMap(this.permissions.client, { format: (value: PermissionsString) => `\`${ctx.case.permission(value)}\`` })} permission${(this.permissions.client).length === 1 ? `` : `s`}.`);

      let role: Role = interaction.guild.roles.cache.get(select_menu.values[0]);

      if (await Autorole.findOne({ guild: interaction.guild.id, roles: role.id })) {

        await select_menu.deferUpdate();

        await Autorole.findOneAndUpdate({ guild: interaction.guild.id }, { $pull: { roles: role.id } }, { upsert: true });

        await interaction.editReply({ embeds: await embed(), components: await components() }); return;
      };

      if (interaction.user.id !== interaction.guild.ownerId && role.position >= interaction.guild.members.cache.get(interaction.user.id).roles.highest.position) return await Return(select_menu, `You do not have access to the selected role.`, true);
      if (role.position >= interaction.guild.members.me.roles.highest.position) return await Return(select_menu, `The selected role cannot be accessed.`, true);
      if ((await Autorole.findOne({ guild: interaction.guild.id })).roles.length >= 3) return await Return(select_menu, `No more roles can be added.`, true);

      await Autorole.findOneAndUpdate({ guild: interaction.guild.id }, { $push: { roles: role.id } }, { upsert: true });

      await interaction.editReply({ embeds: await embed(), components: await components() });

      await select_menu.deferUpdate();
    });

    buttonCollector.on('collect', async (button: ButtonInteraction) => {

      if (interaction.user.id !== button.user.id) return await Return(button, `You cannot use this button.`);
      if (this.permissions && this.permissions.executor && !interaction.guild.members.cache.get(interaction.user.id).permissions.has(this.permissions.executor)) return await Return(button, `You must have ${ctx.case.formattedMap(this.permissions.executor, { format: (value: PermissionsString) => `\`${ctx.case.permission(value)}\`` })} permission${(this.permissions.executor).length === 1 ? `` : `s`} to use the command.`);
      if (this.permissions && this.permissions.client && !interaction.guild.members.me.permissions.has(this.permissions.client)) return await Return(button, `I need ${ctx.case.formattedMap(this.permissions.client, { format: (value: PermissionsString) => `\`${ctx.case.permission(value)}\`` })} permission${(this.permissions.client).length === 1 ? `` : `s`}.`);

      let id: string = button.customId;

      if (id === 'previous') current.page--, current.first = current.first - pageSize, current.last = current.last - pageSize;
      if (id === 'next') current.page++, current.first = current.first + pageSize, current.last = current.last + pageSize;
      if (id === 'search') {

        await button.showModal(
          new Modal({
            customId: 'page-selection',
            title: `Page Selection`,
            components: [
              new ActionRow<TextInput>({
                components: [
                  new TextInput({
                    type: 4,
                    style: 1,
                    customId: `page`,
                    label: `Select Page (1-${pages})`,
                    placeholder: `1-${pages}`,
                    value: String(current.page),
                    min_length: 1,
                    max_length: String(pages).length,
                    required: true,
                  }),
                ],
              }),
            ],
          }),
        );

        return await button.awaitModalSubmit({ filter: (modal: ModalSubmitInteraction) => modal.customId === 'page-selection', time: 5 * 60 * 1000 }).then(async (modal: ModalSubmitInteraction) => {

          let fields: { [index in 'page']: number; } = {
            page: Number(modal.fields.getTextInputValue('page')),
          };

          if (isNaN(fields.page) || fields.page < 1 || fields.page > pages) return await modal.errorReply({ content: `The value does not fit the format.` });
          if (fields.page === current.page) return await modal.errorReply({ content: `Enter page number other than the selected page.` });

          current.page = fields.page;

          current.first = current.page * pageSize - pageSize;
          current.last = current.page * pageSize;

          await interaction.editReply({ embeds: await embed(), components: await components() });

          if (modal.isFromMessage()) await modal.deferUpdate();
        }).catch(() => undefined);
      };

      if (id === 'reset') await Autorole.findOneAndUpdate({ guild: interaction.guild.id }, { $set: { roles: [] } }, { upsert: true });
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