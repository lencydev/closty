import { App } from 'App';

import {
  User,
} from 'Root';

export default class extends App {

  constructor () {
    super({
      name: 'Example',
      type: 2,

      cooldown: false,

      developerOnly: false,
      ownerOnly: false,
      permissions: false,

      enabled: true,
    });
  };

  async execute ({ interaction }: { interaction: AppInteraction; }): Execute {

    let user: User = await client.users.fetch(interaction.targetId, { force: true });

    await interaction.successReply({ ephemeral: false, content: `${user}` });
  };
};