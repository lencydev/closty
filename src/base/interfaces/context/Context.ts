import {
  Embed,
  ActionRow,
  StringSelectMenu,
  Button,
  User,
  UserFlagsString,
  PermissionsString,
  InteractionCollector,
  Modal,
  TextInput,
  ComponentType,
} from 'Root';

import ms from 'ms';

import { extractColors } from 'extract-colors';

type BaseInteraction = AppInteraction | CommandInteraction | StringSelectMenuInteraction | ButtonInteraction | ModalSubmitInteraction;
type ButtonNames = 'previous' | 'next' | 'search' | 'delete';
type Link = { label: string; url: string; disabled?: boolean; };

export class Context {

  readonly util;
  readonly case;
  readonly menu;

  constructor () {

    this.util = {

      splitMessage (text: string, { maxLength = 2000, regex = /\n/g, prepend = '', append = '' }: { maxLength?: number; regex?: RegExp; prepend?: string; append?: string; }): string[] {

        if (text.length <= maxLength) return [ text ];

        let parts: string[] = [];

        let curPart: string = prepend;
        let chunkStartIndex: number = 0;

        let prevDelim: string = '';

        function addChunk (chunkEndIndex: number, nextDelim: string): void {

          let nextChunk: string = text.substring(chunkStartIndex, chunkEndIndex);
          let nextChunkLen: number = nextChunk.length;

          if (prepend.length + nextChunkLen + append.length > maxLength) throw new RangeError('SPLIT_MAX_LEN');

          let lengthWithChunk: number = curPart.length + prevDelim.length + nextChunkLen + append.length;

          if (lengthWithChunk > maxLength) parts.push(curPart + append), curPart = prepend + nextChunk;
          else curPart += prevDelim + nextChunk;

          prevDelim = nextDelim;
          chunkStartIndex = chunkEndIndex + prevDelim.length;
        };

        for (const match of text.matchAll(regex)) addChunk(match.index, match[0]);

        addChunk(text.length - 1, '');

        parts.push(curPart + append);

        return parts;
      },

      progressBar (value: number, maxValue: number, options: { long?: boolean; } = { long: false }): string {

        let Bar1Empty: string = `<:Bar1Empty:964815254284546048>`;
        let Bar2Empty: string = `<:Bar2Empty:964815251965112371>`;
        let Bar3Empty: string = `<:Bar3Empty:964815251352715265>`;

        let Bar1Mid: string = `<a:Bar1Mid:964815254062239805>`;
        let Bar2Mid: string = `<a:Bar2Mid:964815251663106069>`;
        let Bar3Mid: string = `<a:Bar3Mid:964815251205939231>`;

        let Bar1Full: string = `<a:Bar1Full:964815253907062784>`;
        let Bar2Full: string = `<a:Bar2Full:964815251499524104>`;
        let Bar3Full: string = `<a:Bar3Full:964815250916540476>`;

        let percent: number = Number(((value * 100) / maxValue).toFixed(0));

        if (options.long) {

          let bar: string = Bar1Empty + Bar2Empty + Bar2Empty + Bar2Empty + Bar2Empty + Bar2Empty + Bar2Empty + Bar2Empty + Bar2Empty + Bar3Empty;

          if (percent >= 99) bar = Bar1Full + Bar2Full + Bar2Full + Bar2Full + Bar2Full + Bar2Full + Bar2Full + Bar2Full + Bar2Full + Bar3Full;
          else if (percent >= 95) bar = Bar1Full + Bar2Full + Bar2Full + Bar2Full + Bar2Full + Bar2Full + Bar2Full + Bar2Full + Bar2Full + Bar3Mid;
          else if (percent >= 90) bar = Bar1Full + Bar2Full + Bar2Full + Bar2Full + Bar2Full + Bar2Full + Bar2Full + Bar2Full + Bar2Full + Bar3Empty;
          else if (percent >= 85) bar = Bar1Full + Bar2Full + Bar2Full + Bar2Full + Bar2Full + Bar2Full + Bar2Full + Bar2Full + Bar2Mid + Bar3Empty;
          else if (percent >= 80) bar = Bar1Full + Bar2Full + Bar2Full + Bar2Full + Bar2Full + Bar2Full + Bar2Full + Bar2Full + Bar2Empty + Bar3Empty;
          else if (percent >= 75) bar = Bar1Full + Bar2Full + Bar2Full + Bar2Full + Bar2Full + Bar2Full + Bar2Full + Bar2Mid + Bar2Empty + Bar3Empty;
          else if (percent >= 70) bar = Bar1Full + Bar2Full + Bar2Full + Bar2Full + Bar2Full + Bar2Full + Bar2Full + Bar2Empty + Bar2Empty + Bar3Empty;
          else if (percent >= 65) bar = Bar1Full + Bar2Full + Bar2Full + Bar2Full + Bar2Full + Bar2Full + Bar2Mid + Bar2Empty + Bar2Empty + Bar3Empty;
          else if (percent >= 60) bar = Bar1Full + Bar2Full + Bar2Full + Bar2Full + Bar2Full + Bar2Full + Bar2Empty + Bar2Empty + Bar2Empty + Bar3Empty;
          else if (percent >= 55) bar = Bar1Full + Bar2Full + Bar2Full + Bar2Full + Bar2Full + Bar2Mid + Bar2Empty + Bar2Empty + Bar2Empty + Bar3Empty;
          else if (percent >= 50) bar = Bar1Full + Bar2Full + Bar2Full + Bar2Full + Bar2Full + Bar2Empty + Bar2Empty + Bar2Empty + Bar2Empty + Bar3Empty;
          else if (percent >= 45) bar = Bar1Full + Bar2Full + Bar2Full + Bar2Full + Bar2Mid + Bar2Empty + Bar2Empty + Bar2Empty + Bar2Empty + Bar3Empty;
          else if (percent >= 40) bar = Bar1Full + Bar2Full + Bar2Full + Bar2Full + Bar2Empty + Bar2Empty + Bar2Empty + Bar2Empty + Bar2Empty + Bar3Empty;
          else if (percent >= 35) bar = Bar1Full + Bar2Full + Bar2Full + Bar2Mid + Bar2Empty + Bar2Empty + Bar2Empty + Bar2Empty + Bar2Empty + Bar3Empty;
          else if (percent >= 30) bar = Bar1Full + Bar2Full + Bar2Full + Bar2Empty + Bar2Empty + Bar2Empty + Bar2Empty + Bar2Empty + Bar2Empty + Bar3Empty;
          else if (percent >= 25) bar = Bar1Full + Bar2Full + Bar2Mid + Bar2Empty + Bar2Empty + Bar2Empty + Bar2Empty + Bar2Empty + Bar2Empty + Bar3Empty;
          else if (percent >= 20) bar = Bar1Full + Bar2Full + Bar2Empty + Bar2Empty + Bar2Empty + Bar2Empty + Bar2Empty + Bar2Empty + Bar2Empty + Bar3Empty;
          else if (percent >= 15) bar = Bar1Full + Bar2Mid + Bar2Empty + Bar2Empty + Bar2Empty + Bar2Empty + Bar2Empty + Bar2Empty + Bar2Empty + Bar3Empty;
          else if (percent >= 10) bar = Bar1Full + Bar2Empty + Bar2Empty + Bar2Empty + Bar2Empty + Bar2Empty + Bar2Empty + Bar2Empty + Bar2Empty + Bar3Empty;
          else if (percent >= 5) bar = Bar1Mid + Bar2Empty + Bar2Empty + Bar2Empty + Bar2Empty + Bar2Empty + Bar2Empty + Bar2Empty + Bar2Empty + Bar3Empty;

          return bar;
        };

        if (!options.long) {

          let bar: string = Bar1Empty + Bar2Empty + Bar2Empty + Bar2Empty + Bar3Empty;

          if (percent >= 99) bar = Bar1Full + Bar2Full + Bar2Full + Bar2Full + Bar3Full;
          else if (percent >= 90) bar = Bar1Full + Bar2Full + Bar2Full + Bar2Full + Bar3Mid;
          else if (percent >= 80) bar = Bar1Full + Bar2Full + Bar2Full + Bar2Full + Bar3Empty;
          else if (percent >= 70) bar = Bar1Full + Bar2Full + Bar2Full + Bar2Mid + Bar3Empty;
          else if (percent >= 60) bar = Bar1Full + Bar2Full + Bar2Full + Bar2Empty + Bar3Empty;
          else if (percent >= 50) bar = Bar1Full + Bar2Full + Bar2Mid + Bar2Empty + Bar3Empty;
          else if (percent >= 40) bar = Bar1Full + Bar2Full + Bar2Empty + Bar2Empty + Bar3Empty;
          else if (percent >= 30) bar = Bar1Full + Bar2Mid + Bar2Empty + Bar2Empty + Bar3Empty;
          else if (percent >= 20) bar = Bar1Full + Bar2Empty + Bar2Empty + Bar2Empty + Bar3Empty;
          else if (percent >= 10) bar = Bar1Mid + Bar2Empty + Bar2Empty + Bar2Empty + Bar3Empty;

          return bar;
        };
      },
    };

    this.case = {

      time (values: string): number {

        try {

          let blockedArgs: string[] = [ `-`, `.`, `ms`, `msec`, `msecs`, `milisecond`, `miliseconds` ];

          let result: number = 0;
          let input: number;

          for (let value of values.split(` `)) {

            if (!ms(value)) return;
            if (!isNaN(Number(value))) return;
            if (blockedArgs.some((arg: string) => value.includes(arg))) return;

            input = ms(value);
            result = input + result;
          };

          return result;

        } catch {

          return;
        };
      },

      timeformat (milliseconds: number, options: { long?: boolean; } = { long: false }): string {

        let values: string[] = [];

        let time: { [index in 'years' | 'days' | 'hours' | 'minutes' | 'seconds' | 'milliseconds']: number; } = {
          years: Math.trunc(milliseconds / 31556926000),
          days: Math.trunc(milliseconds / 86400000) % 365,
          hours: Math.trunc(milliseconds / 3600000) % 24,
          minutes: Math.trunc(milliseconds / 60000) % 60,
          seconds: Math.trunc(milliseconds / 1000) % 60,
          milliseconds: Math.trunc(milliseconds) % 1000,
        };

        if (time.years) values.push(options.long ? `${time.years} year${time.years === 1 ? `` : `s`}` : `${time.years}y`);
        if (time.days) values.push(options.long ? `${time.days} day${time.days === 1 ? `` : `s`}` : `${time.days}d`);
        if (time.hours) values.push(options.long ? `${time.hours} hour${time.hours === 1 ? `` : `s`}` : `${time.hours}h`);
        if (time.minutes) values.push(options.long ? `${time.minutes} minute${time.minutes === 1 ? `` : `s`}` : `${time.minutes}m`);
        if (time.seconds) values.push(options.long ? `${time.seconds}${time.milliseconds !== 0 ? time.milliseconds >= 100 ? `.${time.milliseconds.toString()[0]}` : `` : ``} second${time.seconds === 1 && time.milliseconds < 100 ? `` : `s`}` : `${time.seconds}s`);
        if (!time.seconds && time.milliseconds) values.push(options.long ? `${time.milliseconds} millisecond${time.milliseconds === 1 ? `` : `s`}` : `${time.milliseconds}ms`);

        return values.join(` `);
      },

      formattedMap <Key extends any[]> (array: Key, { format }: { format: (value: Key[number]) => any; }): any {

        return array.length > 1 ? `${array.slice(0, -1).map((value: any) => format(value)).join(`, `)} and ${format(array[array.length - 1])}` : format(array[0]);
      },

      timestamp (value: number | Date): number {

        return Math.floor(new Date(value).getTime() / 1000);
      },

      async imageColor (value: string): Promise<string> {

        let result: string;

        await extractColors(value).then((colors: any[]) => result = colors[0].hex.replace(/#/, ``));

        return result;
      },

      random (): string {

        return Math.random().toString(36).substring(2) + Date.now() + Math.random().toString(36).substring(2);
      },

      title (value: string): string {

        return value.split(` `).map((word: string) => `${word[0].toUpperCase()}${word.slice(1).toLowerCase()}`).join(` `);
      },

      permission (permission: PermissionsString): string {

        return permission.replace(/([A-Z])/g, ` $1`).trim().replaceAll(` And `, ` and `).replaceAll(` In `, ` in `).replaceAll(` To `, ` to `).replaceAll(`T T S`, `TTS`).replaceAll(`V A D`, `VAD`).replaceAll(`Guild`, `Server`);
      },

      filter (value: string): string {

        return value.replace(/([*_~`])/g, `\$1`).trim();
      },

      number (number: number): string {

        return Intl.NumberFormat().format(number).replaceAll(`,`, `.`);
      },

      formattedNumber (number: number, decPlaces: number = 1): string {

        decPlaces = Math.pow(10, decPlaces);

        let abbrev: string[] = [ `K`, `M`, `B`, `T` ];

        for (let i: number = abbrev.length - 1; i >= 0; i--) {

          let size: number = Math.pow(10, (i + 1) * 3);

          if (size <= number) {

            number = Math.round(number * decPlaces / size) / decPlaces;

            if ((number === 1000) && (i < abbrev.length - 1)) number = 1, i++;

            (number as unknown as string) += abbrev[i];
            break;
          };
        };

        return String(number);
      },

      emojiNumber (number: number): string {

        return number.toString().replace(/([0-9])/g, (value: string) => {
          return {
            '0': `<a:Number_0:996127979048534096>`,
            '1': `<a:Number_1:996127984736010290>`,
            '2': `<a:Number_2:996127988523483157>`,
            '3': `<a:Number_3:996127995112730755>`,
            '4': `<a:Number_4:996128001479675935>`,
            '5': `<a:Number_5:996128008983285881>`,
            '6': `<a:Number_6:996128015920664617>`,
            '7': `<a:Number_7:996128022786740384>`,
            '8': `<a:Number_8:996128034388180992>`,
            '9': `<a:Number_9:996128041510113372>`,
          }[value];
        });
      },

      badge (badge: UserFlagsString, options: { icon?: boolean; } = { icon: false }): string {

        let badges: any;

        if (!options.icon) badges = {
          Staff: 'Discord Staff',
          Partner: 'Partner',
          CertifiedModerator: 'Certified Moderator',
          Hypesquad: 'HypeSquad Events',

          HypeSquadOnlineHouse1: 'HypeSquad Bravery',
          HypeSquadOnlineHouse2: 'HypeSquad Brilliance',
          HypeSquadOnlineHouse3: 'HypeSquad Balance',

          BugHunterLevel1: 'Bug Hunter',
          BugHunterLevel2: 'Bug Hunter Gold',

          ActiveDeveloper: 'Active Developer',
          VerifiedDeveloper: 'Early Verified Bot Developer',
          PremiumEarlySupporter: 'Early Supporter',
        };

        if (options.icon) badges = Emoji.Badge;

        return badges[badge];
      },
    };

    this.menu = {

      async paginate (interaction: BaseInteraction, options: PaginateOptions): Promise<void> {

        const {
          users = [ interaction.user, ...Data.Developers.map((developer: { id: string; }) => client.users.cache.get(developer.id)) ],
          ephemeral = false,
          pageSize = 1,
          showPages = true,
          sorts,
          menus,
          embeds,
        } = options;

        let styles: { [index in ButtonNames]: number; } = {
          previous: 2,
          next: 2,
          search: 1,
          delete: 4,
        };

        let emojis: { [index in ButtonNames]: string; } = {
          previous: Emoji.Button.Previous,
          next: Emoji.Button.Next,
          search: Emoji.Button.Search,
          delete: Emoji.Button.Delete,
        };

        let current: { [index in 'default' | 'sort' | 'menu' | 'page' | 'first' | 'last']: number; } = {
          default: 0,
          sort: 0,
          menu: 0,
          page: 1,
          first: 0,
          last: pageSize,
        };

        let menu: AsyncReturnType<PaginateOptions['menus']> = (await menus(sorts ? sorts[current.sort].sort : undefined));

        let value: Embed[] | string[] = menu.find((option: AsyncReturnType<PaginateOptions['menus']>[0]) => option.default)?.value ?? menu[current.menu].value;

        if (menu.length > 1 && !value.length) {

          await Promise.all(menu.map(async () => {
            if (!value.length) current.menu++, value = menu[current.menu].value;
          }));
        };

        let links: AsyncReturnType<PaginateOptions['menus']>[0]['links'] = menu[current.menu].links;

        if (!value.length) return await interaction.errorReply({ content: menu[current.menu].errorResponse || `Not enough data was found.` });

        let pages: number = parseArray(value) ? Math.ceil(value.length / pageSize) : value.length;

        async function embed (): Promise<Embed[]> {

          let oldEmbed: Embed = parseArray(value) ? (await embeds({ value, first: current.first, last: current.last, label: menu[current.menu].label, emoji: menu[current.menu].emoji ? String(client.emojis.cache.get(menu[current.menu].emoji)) : ``, page: current.page, pages }))[0] : value[current.page - 1];
          let newEmbed: Embed = new Embed(oldEmbed.data);

          if (pages === 1 || !showPages) return [ newEmbed ];
          if (oldEmbed?.data.footer?.text) return [ newEmbed.setFooter({ text: `Page: ${current.page}/${pages} | ${oldEmbed.data.footer.text}`, iconURL: oldEmbed.data.footer.icon_url }) ];
          return [ newEmbed.setFooter({ text: `Page: ${current.page}/${pages}` }) ];
        };

        function buttons (status?: boolean): Button[] {

          function checkPage (button: ButtonNames): boolean {

            if (button === 'previous' && current.page <= 1) return true;
            if (button === 'next' && current.page >= pages) return true;

            return false;
          };

          let buttons: ButtonNames[] = [];

          if (pages > 1) buttons = [ 'previous', 'next' ];
          if (pages > 2) buttons = [ ...buttons, 'search' ];
          if (!ephemeral) buttons = [ ...buttons, 'delete' ];

          return buttons.reduce((buttons: Button[], button: ButtonNames): Button[] => {

            buttons.push(new Button({ style: styles[button], emoji: { id: emojis[button] }, customId: button, disabled: status || checkPage(button) }));

            return buttons;
          }, []);
        };

        async function components (status?: boolean): Promise<Array<ActionRow<ActionRowComponent>>> {

          if (!status) ++current.default;

          let components: Array<ActionRow<ActionRowComponent>> = [];

          if (sorts && sorts.length > 1 && parseArray(value)) {

            components = [
              new ActionRow<ActionRowComponent>({
                components: [
                  new StringSelectMenu({
                    customId: `sort`,
                    disabled: status,
                    options: await Promise.all(sorts.map((select_menu: PaginateOptions['sorts'][0], index: number) => {
                      return {
                        emoji: select_menu.emoji ? { id: select_menu.emoji } : undefined,
                        label: select_menu.label || 'undefined',
                        description: select_menu.description,
                        value: String(index),
                        default: index === current.sort,
                      };
                    })),
                  }),
                ],
              }),
            ];
          };

          if (menu.length > 1) {

            components = [
              ...components,
              new ActionRow<ActionRowComponent>({
                components: [
                  new StringSelectMenu({
                    customId: `list`,
                    disabled: status,
                    options: await Promise.all(menu.map((select_menu: AsyncReturnType<PaginateOptions['menus']>[0], index: number) => {
                      return {
                        emoji: select_menu.emoji ? { id: select_menu.emoji } : undefined,
                        label: select_menu.label || 'undefined',
                        description: select_menu.description,
                        value: String(index),
                        default: current.default === 1 ? select_menu.default ?? index === current.menu : index === current.menu,
                      };
                    })),
                  }),
                ],
              }),
            ];
          };

          if (links && links.length) {

            for (let i: number = 0; i < links.length; i += 3) {

              let linksChunk: AsyncReturnType<PaginateOptions['menus']>[0]['links'] = links.slice(i, i + 3);

              components = [
                ...components,
                new ActionRow<ActionRowComponent>({
                  components: linksChunk.map((link: AsyncReturnType<PaginateOptions['menus']>[0]['links'][0]) => new Button({ style: 5, emoji: link.emoji ? { id: link.emoji } : undefined, label: link.label, url: link.url, disabled: link.disabled })),
                }),
              ];
            };
          };

          if (buttons().length) {

            components = [
              ...components,
              new ActionRow<ActionRowComponent>({
                components: buttons(status),
              }),
            ];
          };

          return components;
        };

        let message: Message;

        if (interaction.replied) message = await interaction.editReply({ content: null, embeds: await embed(), components: await components() });
        else if (interaction.deferred) message = await interaction.followUp({ ephemeral, embeds: await embed(), components: await components() });
        else message = await interaction.reply({ ephemeral, embeds: await embed(), components: await components(), fetchReply: true });

        let sortCollector: InteractionCollector<StringSelectMenuInteraction> = message.createMessageComponentCollector({ componentType: ComponentType.StringSelect, filter: (select_menu: StringSelectMenuInteraction) => select_menu.customId === 'sort', time: 5 * 60 * 1000 });
        let listCollector: InteractionCollector<StringSelectMenuInteraction> = message.createMessageComponentCollector({ componentType: ComponentType.StringSelect, filter: (select_menu: StringSelectMenuInteraction) => select_menu.customId === 'list', time: 5 * 60 * 1000 });
        let buttonCollector: InteractionCollector<ButtonInteraction> = message.createMessageComponentCollector({ componentType: ComponentType.Button, time: 5 * 60 * 1000 });

        sortCollector.on('collect', async (select_menu: StringSelectMenuInteraction) => {

          if (!users.some((user: User) => user.id === select_menu.user.id)) {

            await select_menu.deferUpdate();

            await select_menu.errorReply({ content: `You cannot use this select menu.` }); return;
          };

          current.sort = Number(select_menu.values[0]);

          menu = (await menus(sorts ? sorts[current.sort].sort : undefined));
          value = menu[current.menu].value;

          await interaction.editReply({ embeds: await embed(), components: await components() });

          await select_menu.deferUpdate();
        });

        listCollector.on('collect', async (select_menu: StringSelectMenuInteraction) => {

          if (!users.some((user: User) => user.id === select_menu.user.id)) {

            await select_menu.deferUpdate();

            await select_menu.errorReply({ content: `You cannot use this select menu.` }); return;
          };

          if (menu[Number(select_menu.values[0])].value.length < 1) {

            await select_menu.deferUpdate();

            await interaction.editReply({ embeds: await embed() });

            await select_menu.errorReply({ content: menu[Number(select_menu.values[0])].errorResponse || `Not enough data was found.` }); return;
          };

          current.menu = Number(select_menu.values[0]);
          current.page = 1;

          current.first = 0;
          current.last = pageSize;

          value = menu[current.menu].value;
          links = menu[current.menu].links;

          pages = parseArray(value) ? Math.ceil(value.length / pageSize) : value.length;

          await interaction.editReply({ embeds: await embed(), components: await components() });

          await select_menu.deferUpdate();
        });

        buttonCollector.on('collect', async (button: ButtonInteraction) => {

          if (!users.some((user: User) => user.id === button.user.id)) {

            await button.deferUpdate();

            await button.errorReply({ content: `You cannot use this button.` }); return;
          };

          let id: ButtonNames = button.customId as ButtonNames;

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
          if (id === 'delete') return await interaction.deleteReply();

          await interaction.editReply({ embeds: await embed(), components: await components() });

          await button.deferUpdate();
        });

        buttonCollector.on('end', async () => await interaction.editReply({ components: await components(true) }).catch(() => undefined));
      },

      async paginateWithTransactions (interaction: BaseInteraction, options: PaginateWithTransactionsOptions): Promise<void> {

        const {
          users = [ interaction.user, ...Data.Developers.map((developer: { id: string; }) => client.users.cache.get(developer.id)) ],
          ephemeral = false,
          pageSize = 1,
          showPages = true,
          sorts,
          filters,
          menus,
          transactions,
          embeds,
        } = options;

        let defaultStyles: { [index in ButtonNames]: number; } = {
          previous: 2,
          next: 2,
          search: 1,
          delete: 4,
        };

        let defaultEmojis: { [index in ButtonNames]: string; } = {
          previous: Emoji.Button.Previous,
          next: Emoji.Button.Next,
          search: Emoji.Button.Search,
          delete: Emoji.Button.Delete,
        };

        let current: { [index in 'filter' | 'sort' | 'menu' | 'page' | 'first' | 'last']: number; } = {
          filter: 0,
          sort: 0,
          menu: 0,
          page: 1,
          first: 0,
          last: pageSize,
        };

        let menu: Array<{ emoji?: string; label?: string; description?: string; value: Embed[] | string[]; links?: Array<{ label: string; url: string; disabled?: boolean; }>; }> = (await menus(sorts ? sorts[current.sort].sort : undefined, filters));
        let transaction: Array<{ emoji?: string; label?: string; description?: string; value: string; execute: (menu: StringSelectMenuInteraction, ...items: any[]) => Promise<void>; }> = transactions ? (await transactions.options(current.first, current.last, sorts ? sorts[current.sort].sort : undefined, filters ? filters[current.filter].filter : undefined)) : undefined;

        let value: Embed[] | string[] = menu[current.menu].value;

        if (value && !value.length) {

          await Promise.all(menu.map(async () => {
            if (!value.length) return current.menu = current.menu + 1, value = menu[current.menu].value;
          }));
        };

        let links: Array<{ label: string; url: string; disabled?: boolean; }> = menu[current.menu].links;

        if (!value.length) return await interaction.errorReply({ content: `Not enough data was found.` });

        let pages: number = parseArray(value) ? Math.ceil(value.length / pageSize) : value.length;

        let buttons = (status?: boolean): Button[] => {

          let checkPage = (button: ButtonNames): boolean => {

            if (([ 'previous' ] as ButtonNames[]).includes(button) && current.page === 1) return true;
            if (([ 'next' ] as ButtonNames[]).includes(button) && current.page === pages) return true;

            return false;
          };

          let buttons: ButtonNames[] = [];

          if (pages > 1) buttons = [ 'previous', 'next' ];
          if (pages > 2) buttons = [ ...buttons, 'search' ];
          if (!ephemeral) buttons = [ ...buttons, 'delete' ];

          return buttons.reduce((buttons: Button[], button: ButtonNames): Button[] => {

            buttons.push(new Button({ style: defaultStyles[button], emoji: { id: defaultEmojis[button] }, customId: button, disabled: status || checkPage(button) }));

            return buttons;
          }, []);
        };

        let components = async (status?: boolean): Promise<Array<ActionRow<ActionRowComponent>>> => {

          let components: Array<ActionRow<ActionRowComponent>> = [];

          if (sorts && sorts.length > 1 && parseArray(value)) {

            components = [
              new ActionRow<ActionRowComponent>({
                components: [
                  new StringSelectMenu({
                    customId: `sort`,
                    disabled: status,
                    options: await Promise.all(sorts.map((select_menu: { emoji?: string; label?: string; description?: string; sort: (first: any, last: any) => number; }, index: number) => {
                      return {
                        emoji: select_menu.emoji === undefined ? undefined : { id: select_menu.emoji },
                        label: select_menu.label || 'undefined',
                        description: select_menu.description,
                        value: String(index),
                        default: index === current.sort,
                      };
                    })),
                  }),
                ],
              }),
            ];
          };

          if (menu.length > 1) {

            components = [
              ...components,
              new ActionRow<ActionRowComponent>({
                components: [
                  new StringSelectMenu({
                    customId: `list`,
                    disabled: status,
                    options: await Promise.all(menu.map((select_menu: { emoji?: string; label?: string; description?: string; value: Embed[] | string[]; }, index: number) => {
                      return {
                        emoji: select_menu.emoji === undefined ? undefined : { id: select_menu.emoji },
                        label: select_menu.label || 'undefined',
                        description: select_menu.description,
                        value: String(index),
                        default: index === current.menu,
                      };
                    })),
                  }),
                ],
              }),
            ];
          };

          if (transactions && transaction.length > 0 && parseArray(value)) {

            components = [
              ...components,
              new ActionRow<ActionRowComponent>({
                components: [
                  new StringSelectMenu({
                    customId: `transaction`,
                    placeholder: transactions.placeholder,
                    disabled: status,
                    options: await Promise.all(transaction.map((select_menu: { emoji?: string; label?: string; description?: string; value: string; execute: (menu: StringSelectMenuInteraction, ...items: any[]) => Promise<void>; }) => {
                      return {
                        emoji: select_menu.emoji === undefined ? undefined : { id: select_menu.emoji },
                        label: select_menu.label || 'undefined',
                        description: select_menu.description,
                        value: select_menu.value,
                      };
                    })),
                  }),
                ],
              }),
            ];
          };

          if (links && links.length) {

            for (let i: number = 0; i < links.length; i += 3) {

              let linksChunk: Link[] = links.slice(i, i + 3);

              components = [
                ...components,
                new ActionRow<ActionRowComponent>({
                  components: linksChunk.map((link: Link) => new Button({ style: 5, label: link.label, url: link.url, disabled: link.disabled })),
                }),
              ];
            };
          };

          if (buttons().length) {

            components = [
              ...components,
              new ActionRow<ActionRowComponent>({
                components: buttons(status),
              }),
            ];
          };

          return components;
        };

        let embed = async (): Promise<Embed[]> => {

          let oldEmbed: Embed = parseArray(value) ? (await embeds({ value: value, first: current.first, last: current.last, label: menu[current.menu].label, emoji: menu[current.menu].emoji ? String(client.emojis.cache.get(menu[current.menu].emoji)) : ``, page: current.page, pages }))[0] : value[current.page - 1];
          let newEmbed: Embed = new Embed(oldEmbed.data);

          if (pages === 1 || !showPages) return [ newEmbed ];
          if (oldEmbed?.data.footer?.text) return [ newEmbed.setFooter({ text: `Page: ${current.page}/${pages} | ${oldEmbed.data.footer.text}`, iconURL: oldEmbed.data.footer.icon_url }) ];
          return [ newEmbed.setFooter({ text: `Page: ${current.page}/${pages}` }) ];
        };

        let message: Message;

        if (interaction.replied) message = await interaction.editReply({ content: null, embeds: await embed(), components: await components() });
        else if (interaction.deferred) message = await interaction.followUp({ ephemeral, embeds: await embed(), components: await components() });
        else message = await interaction.reply({ ephemeral, embeds: await embed(), components: await components(), fetchReply: true });

        let sortCollector: InteractionCollector<StringSelectMenuInteraction> = message.createMessageComponentCollector({ componentType: ComponentType.StringSelect, filter: (select_menu: StringSelectMenuInteraction) => select_menu.customId === 'sort', time: 5 * 60 * 1000 });
        let listCollector: InteractionCollector<StringSelectMenuInteraction> = message.createMessageComponentCollector({ componentType: ComponentType.StringSelect, filter: (select_menu: StringSelectMenuInteraction) => select_menu.customId === 'list', time: 5 * 60 * 1000 });
        let transactionCollector: InteractionCollector<StringSelectMenuInteraction> = message.createMessageComponentCollector({ componentType: ComponentType.StringSelect, filter: (select_menu: StringSelectMenuInteraction) => select_menu.customId === 'transaction', time: 5 * 60 * 1000 });
        let buttonCollector: InteractionCollector<ButtonInteraction> = message.createMessageComponentCollector({ componentType: ComponentType.Button, time: 5 * 60 * 1000 });

        sortCollector.on('collect', async (select_menu: StringSelectMenuInteraction) => {

          if (!users.some((user: User) => user.id === select_menu.user.id)) {

            await select_menu.deferUpdate();

            await select_menu.errorReply({ content: `You cannot use this select menu.` }); return;
          };

          current.sort = Number(select_menu.values[0]);

          transaction = transactions ? (await transactions.options(current.first, current.last, sorts ? sorts[current.sort].sort : undefined, filters ? filters[current.filter].filter : undefined)) : undefined;

          menu = (await menus(sorts ? sorts[current.sort].sort : undefined, filters ? filters : undefined));
          value = menu[current.menu].value;

          await interaction.editReply({ embeds: await embed(), components: await components() });

          await select_menu.deferUpdate();
        });

        listCollector.on('collect', async (select_menu: StringSelectMenuInteraction) => {

          if (!users.some((user: User) => user.id === select_menu.user.id)) {

            await select_menu.deferUpdate();

            await select_menu.errorReply({ content: `You cannot use this select menu.` }); return;
          };

          if (menu[Number(select_menu.values[0])].value.length < 1) {

            await select_menu.deferUpdate();

            await interaction.editReply({ embeds: await embed() });

            await select_menu.errorReply({ content: `Not enough data was found.` }); return;
          };

          current.filter = Number(select_menu.values[0]);
          current.menu = Number(select_menu.values[0]);
          current.page = 1;

          current.first = 0;
          current.last = pageSize;

          value = menu[current.menu].value;
          links = menu[current.menu].links;

          pages = parseArray(value) ? Math.ceil(value.length / pageSize) : value.length;

          transaction = transactions ? (await transactions.options(current.first, current.last, sorts ? sorts[current.sort].sort : undefined, filters ? filters[current.filter].filter : undefined)) : undefined;

          await interaction.editReply({ embeds: await embed(), components: await components() });

          await select_menu.deferUpdate();
        });

        transactionCollector.on('collect', async (select_menu: StringSelectMenuInteraction) => {

          if (!users.some((user: User) => user.id === select_menu.user.id)) {

            await select_menu.deferUpdate();

            await select_menu.errorReply({ content: `You cannot use this select menu.` }); return;
          };

          await transaction[0].execute(select_menu, await transactions.get(select_menu.values[0]));

          await interaction.editReply({ embeds: await embed(), components: await components() });
        });

        buttonCollector.on('collect', async (button: ButtonInteraction) => {

          if (!users.some((user: User) => user.id === button.user.id)) {

            await button.deferUpdate();

            await button.errorReply({ ephemeral: true, content: `You cannot use this button.` }); return;
          };

          let id: ButtonNames = button.customId as ButtonNames;

          if (id === 'previous') current.page--, current.first = current.first - pageSize, current.last = current.last - pageSize;
          if (id === 'next') current.page++, current.first = current.first + pageSize, current.last = current.last + pageSize;
          if (id === 'delete') return await interaction.deleteReply();

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

              if (isNaN(fields.page) || fields.page > pages) return await modal.errorReply({ content: `The value does not fit the format.` });
              if (fields.page === current.page) return await modal.errorReply({ content: `Enter page number other than the selected page.` });

              current.page = fields.page;

              current.first = current.page * pageSize - pageSize;
              current.last = current.page * pageSize;

              transaction = transactions ? (await transactions.options(current.first, current.last, sorts ? sorts[current.sort].sort : undefined, filters ? filters[current.filter].filter : undefined)) : undefined;

              await interaction.editReply({ embeds: await embed(), components: await components() });

              if (modal.isFromMessage()) await modal.deferUpdate();
            }).catch(() => undefined);
          };

          transaction = transactions ? (await transactions.options(current.first, current.last, sorts ? sorts[current.sort].sort : undefined, filters ? filters[current.filter].filter : undefined)) : undefined;

          await interaction.editReply({ embeds: await embed(), components: await components() });

          await button.deferUpdate();
        });

        buttonCollector.on('end', async () => await interaction.editReply({ components: await components(true) }).catch(() => undefined));
      },
    };
  };
};

function parseArray (input: Embed[] | string[]): input is string[] {

  return typeof input[0] === `string` ? true : false;
};