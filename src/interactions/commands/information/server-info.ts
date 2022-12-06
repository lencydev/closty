import { Command } from 'Command';

import {
  Embed,
} from 'Root';

export default class extends Command {

  constructor () {
    super({
      name: 'server-info',
      description: 'Shows server information.',
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

    let tiers: { [index in Numbers<0, 4>]: { emoji: string; count: string; }; } = {
      0: { emoji: Emoji.Utils.Tier.Zero, count: `/2` },
      1: { emoji: Emoji.Utils.Tier.One, count: `/7` },
      2: { emoji: Emoji.Utils.Tier.Two, count: `/14` },
      3: { emoji: Emoji.Utils.Tier.Three, count: `` },
    };

    let verificationLevels: { [index in Numbers<0, 5>]: string; } = {
      0: `None`,
      1: `Low`,
      2: `Medium`,
      3: `High`,
      4: `Highest`,
    };

    await ctx.menu.paginate(interaction, {
      ephemeral,
      menus: async () => [
        {
          value: [
            new Embed({
              color: Color.Default,
              thumbnail: {
                url: interaction.guild.icon ? interaction.guild.iconURL({ forceStatic: false, size: 512, extension: `png` }) : 'https://cdn.discordapp.com/attachments/997192404694204506/1024659802569330719/blank.png',
              },
              author: {
                name: `Server Information`,
                iconURL: client.user.displayAvatarURL(),
                url: Data.InviteURL,
              },
              title: `${interaction.guild.verified && interaction.guild.partnered ? Emoji.Utils.VerifiedAndPartneredServer : interaction.guild.verified ? Emoji.Utils.VerifiedServer : interaction.guild.partnered ? Emoji.Utils.DiscordPartnerServer : tiers[interaction.guild.premiumTier].emoji} ${interaction.guild.name}`,
              url: interaction.guild.vanityURLCode ? `https://discord.gg/${interaction.guild.vanityURLCode}` : undefined,
              description: interaction.guild.description ? interaction.guild.description : undefined,
              fields: [
                { name: `Server Owner`, value: `${Emoji.Utils.Crown} ${client.users.cache.get(interaction.guild.ownerId)}`, inline: true },
                { name: `Boosts`, value: `${interaction.guild.premiumSubscriptionCount}${tiers[interaction.guild.premiumTier].count}`, inline: false },
                { name: `Verification Level`, value: `${verificationLevels[interaction.guild.verificationLevel]}`, inline: false },
                { name: `Creation Date`, value: `${interaction.guild.createdTimestamp.toUnix('F')} (${interaction.guild.createdTimestamp.toUnix('R')})`, inline: false },
              ],
            }),
          ],
        },
      ],
    });
  };
};