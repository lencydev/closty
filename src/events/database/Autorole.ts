import { Event } from 'Event';

import { Autorole } from 'Schemas';

import {
  GuildMember,
} from 'Root';

export default class extends Event {

  constructor () {
    super({
      type: 'guildMemberAdd',
      enabled: true,
    });
  };

  async execute (member: GuildMember): Promise<void> {

    if (member.user.bot) return;

    let data = async (): Promise<SchemaType<AutoroleSchema>> => await Autorole.findOne({ guild: member.guild.id });

    if (await data()) {

      if (!member.guild.members.me.permissions.has('Administrator')) return (await data()).deleteOne();

      if ((await data()).roles.length) {

        await Promise.all((await data()).roles.map(async (id: string) => {

          if (!member.guild.roles.cache.has(id)) await Autorole.findOneAndUpdate({ guild: member.guild.id }, { $pull: { roles: id } }, { upsert: true });
          if (member.guild.roles.cache.get(id).position >= member.guild.members.me.roles.highest.position) await Autorole.findOneAndUpdate({ guild: member.guild.id }, { $pull: { roles: id } }, { upsert: true });
        }));
      };

      if ((await data()).roles.length) await member.roles.add((await data()).roles);
    };
  };
};