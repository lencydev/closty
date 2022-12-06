import { Event } from 'Event';

import {
  Guild,
} from 'Root';

export default class extends Event {

  constructor () {
    super({
      type: 'guildDelete',
      enabled: true,
    });
  };

  async execute (guild: Guild): Promise<void> {

    logger.send(`Deleted Guild: ${TextColor(`${guild.name} (${guild.id})`, '#7E58F2')}`, { type: 3 });
  };
};