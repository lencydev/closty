import { Event } from 'Event';

import {
  Guild,
} from 'Root';

export default class extends Event {

  constructor () {
    super({
      type: 'guildCreate',
      enabled: true,
    });
  };

  async execute (guild: Guild): Promise<void> {

    logger.send(`Added Guild: ${TextColor(`${guild.name} (${guild.id})`, '#7E58F2')}`, { type: 3 });
  };
};