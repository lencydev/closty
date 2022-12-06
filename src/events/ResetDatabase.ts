import { Event } from 'Event';

import { Autorole } from 'Schemas';

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

    let autorole = async (): Promise<SchemaType<AutoroleSchema>> => await Autorole.findOne({ guild: guild.id });

    if (await autorole()) (await autorole()).deleteOne();
  };
};