import { Command } from 'Command';

import {
  Embed,
  ActionRow,
  Modal,
  TextInput,
  ModalSubmitInteraction,
  GuildMember,
} from 'Root';

export default class extends Command {

  constructor () {
    super({
      name: 'discrim',
      description: 'Lists users with the specified discrim.',

      cooldown: { time: '10s', global: false },

      category: 'information',

      developerOnly: false,
      ownerOnly: false,
      permissions: false,

      enabled: true,
    });
  };

  async execute ({ interaction }: { interaction: CommandInteraction; }): Execute {

    await interaction.showModal(
      new Modal({
        customId: 'discrim',
        title: `Discrim`,
        components: [
          new ActionRow<TextInput>({
            components: [
              new TextInput({
                type: 4,
                style: 1,
                customId: `discrim`,
                label: `Discrim`,
                placeholder: `0000`,
                value: interaction.user.discriminator,
                min_length: 4,
                max_length: 4,
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
                value: 'false',
                min_length: 4,
                max_length: 5,
                required: false,
              }),
            ],
          }),
        ],
      }),
    );

    await interaction.awaitModalSubmit({ filter: (modal: ModalSubmitInteraction) => modal.customId === `discrim`, time: 5 * 60 * 1000 }).then(async (modal: ModalSubmitInteraction) => {

      let discrim: string = modal.fields.getTextInputValue('discrim');
      let ephemeral: boolean = modal.fields.getTextInputValue('ephemeral').toLowerCase() === `true` ? true : false;

      if (!(/^\d+$/).test(discrim)) return await modal.errorReply({ content: `Discriminator can only be number.` });
      if (discrim === `0000`) return await modal.errorReply({ content: `Discriminator cannot be \`0000\`.` });

      await ctx.menu.paginate(modal, {
        ephemeral,
        pageSize: 10,
        sorts: [
          {
            emoji: Emoji.SelectMenu.Join.NewToOld,
            label: `Date of Join: New to Old`,
            sort: (first: GuildMember, last: GuildMember) => last.joinedTimestamp - first.joinedTimestamp,
          },
          {
            emoji: Emoji.SelectMenu.Join.OldToNew,
            label: `Date of Join: Old to New`,
            sort: (first: GuildMember, last: GuildMember) => first.joinedTimestamp - last.joinedTimestamp,
          },
        ],
        menus: async (sort: (first: GuildMember, last: GuildMember) => number) => [
          {
            value: interaction.guild.members.cache.filter((member: GuildMember) => member.user.discriminator === discrim).sort(sort).map((member: GuildMember) => member).map((member: GuildMember, index: number) => `**${index + 1}** ${member.user.link(true)} (${(member.joinedTimestamp).toUnix('R')})\n`),
          },
        ],
        embeds: async (data: Parameters<PaginateOptions['embeds']>[0]) => {
          return [
            new Embed({
              color: Color.Default,
              author: {
                name: `Discrim`,
                iconURL: client.user.displayAvatarURL(),
              },
              title: `Users with #${discrim} Discrim (${ctx.case.number(interaction.guild.members.cache.filter((member: GuildMember) => member.user.discriminator === discrim).size)})`,
              description: data.value.slice(data.first, data.last).join(``),
            }),
          ];
        },
      });
    });
  };
};