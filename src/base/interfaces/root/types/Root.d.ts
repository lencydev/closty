import 'discord.js';

export declare global {

  export type SelectMenuInteraction = StringSelectMenuInteraction | UserSelectMenuInteraction | RoleSelectMenuInteraction | ChannelSelectMenuInteraction;

  export {
    ClientEvents,
    Message,
    Interaction,
    ChatInputCommandInteraction as CommandInteraction,
    ContextMenuCommandInteraction as AppInteraction,
    StringSelectMenuInteraction,
    UserSelectMenuInteraction,
    RoleSelectMenuInteraction,
    ChannelSelectMenuInteraction,
    ButtonInteraction,
    ModalSubmitInteraction,
    MessageActionRowComponentBuilder as ActionRowComponent,
  } from 'discord.js';
};