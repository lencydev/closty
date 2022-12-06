import { Command } from 'Command';

import { inspect } from 'util';

import {
  Embed,
  ActionRow,
  Modal,
  TextInput,
  parseEmoji,
} from 'Root';

export default class extends Command {

  constructor () {
    super({
      name: 'eval',
      description: 'Evaluates code and execute.',

      cooldown: false,

      category: 'developer',

      developerOnly: true,
      ownerOnly: false,
      permissions: false,

      enabled: true,
    });
  };

  async execute ({ interaction }: { interaction: CommandInteraction; }): Execute {

    function clean (value: string): string {

      return typeof value === 'string' ? value.replace(/`/g, '`' + String.fromCharCode(8203)).replace(/@/g, '' + String.fromCharCode(8203)) : value;
    };

    function parseType (input: any): string {

      let isDefault = (input: any): string => input.constructor.name === 'default_1' ? Object.getPrototypeOf(input.constructor).name : input.constructor.name;

      let isPromise: boolean = input instanceof Promise && typeof input.then === 'function' && typeof input.catch === 'function';
      let isArray: string = input instanceof Array ? `Array<${[ ...new Set(input.map((input: any) => isDefault(input))) ].join(' | ')}>` : isDefault(input);

      return isPromise ? `${input.constructor.name === `Promise` ? `Promise` : `Promise<${isArray}>`}` : isArray ? isArray : `Void`;
    };

    await interaction.showModal(
      new Modal({
        customId: 'evaluate',
        title: `Evaluate`,
        components: [
          new ActionRow<TextInput>({
            components: [
              new TextInput({
                type: 4,
                style: 2,
                customId: `code`,
                label: `Code`,
                required: true,
              }),
            ],
          }),
          new ActionRow<TextInput>({
            components: [
              new TextInput({
                type: 4,
                style: 1,
                customId: `ephemeral`,
                label: `Ephemeral Response (true/false)`,
                placeholder: `true/false`,
                value: 'true',
                min_length: 4,
                max_length: 5,
                required: false,
              }),
            ],
          }),
        ],
      }),
    );

    await interaction.awaitModalSubmit({ filter: (modal: ModalSubmitInteraction) => modal.customId === `evaluate`, time: 5 * 60 * 1000 }).then(async (modal: ModalSubmitInteraction) => {

      try {

        let code: string = modal.fields.getTextInputValue('code');
        let ephemeral: boolean = modal.fields.getTextInputValue('ephemeral').toLowerCase() === `true` ? true : false;

        let evaled: any = await eval(`(async () => { return ${code} })();`);
        let inspected: string = inspect(evaled, { depth: 1, showHidden: false });

        let secretValues: string[] = [
          Data.Token,
          Data.MongoDB,
        ];

        await Promise.all(secretValues.map((value: string) => inspected = inspected.replaceAll(value, `❌`)));

        let texts: string[] = ctx.util.splitMessage(clean(inspected), { maxLength: 1015 });

        await ctx.menu.paginate(modal, {
          ephemeral,
          showPages: false,
          menus: async () => [
            {
              value: await Promise.all(texts.map((text: string, index: number) => {
                return new Embed({
                  color: Color.Success,
                  author: {
                    name: `Success`,
                    iconURL: client.emojis.cache.get(parseEmoji(Emoji.CircleSuccess).id).url,
                    url: Data.InviteURL,
                  },
                  fields: [
                    { name: `Type`, value: `\`${parseType(evaled)}\``, inline: true },
                    { name: `Length`, value: `\`${ctx.case.number(clean(inspected).length)}\``, inline: true },
                    { name: `Input`, value: `\`\`\`ts\n${code}\`\`\``, inline: false },
                    { name: `Result ${texts.length > 1 ? `(${++index}/${texts.length})` : ``}`, value: `\`\`\`ts\n${text}\`\`\``, inline: false },
                  ],
                });
              })),
            },
          ],
        });

      } catch (error: any) {

        await modal.reply({
          ephemeral: true,
          embeds: [
            new Embed({
              color: Color.Error,
              author: {
                name: `Error`,
                url: Data.InviteURL,
                iconURL: client.emojis.cache.get(parseEmoji(Emoji.CircleError).id).url,
              },
              description: `\`\`\`ts\n${clean(error).length > 2000 ? `${clean(error).slice(0, 2000)}...` : `${clean(error)}`}\n\`\`\``,
            }),
          ],
        });
      };
    }).catch(() => undefined);
  };
};