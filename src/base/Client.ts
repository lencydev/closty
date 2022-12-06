import 'dotenv/config';

import 'Global';
import 'Debug';

import 'Prototypes';

import { Discord, Collection, GatewayIntentBits, Partials } from 'Root';

import { App } from 'App';
import { Command } from 'Command';

export class Client extends Discord {

  public readonly apps: Collection<string, App>;
  public readonly commands: Collection<string, Command>;

  public readonly cooldowns: { [index in 'app' | 'command']: Collection<string, number>; };

  public languages: string[];

  constructor () {
    super({
      intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildBans,
        GatewayIntentBits.GuildPresences,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.GuildInvites,
        GatewayIntentBits.MessageContent,
      ],
      partials: [
        Partials.User,
        Partials.GuildMember,
        Partials.Message,
        Partials.Channel,
        Partials.Reaction,
      ],
      presence: {
        status: 'online',
        activities: [
          {
            name: '/help',
            type: 5,
          },
        ],
      },
      allowedMentions: {
        parse: [],
        users: [],
        roles: [],
        repliedUser: false,
      },
    });

    global.client = this;

    this.apps = new Collection();
    this.commands = new Collection();

    this.cooldowns = {
      app: new Collection(),
      command: new Collection(),
    };
  };

  async load (): Promise<void> {

    await import('./loaders/Database');
    await import('./loaders/DatabaseCleaning');
    await import('./loaders/Handlers');
    await import('./loaders/Events');
    await import('./loaders/Languages');

    await this.login(Data.Token).then(async () => {

      await import('./loaders/Interactions');

      console.log(`\n  ${TextColor(this.user.username.toUpperCase(), '#FA6A8C', true)} ${TextColor(`v${require('../../package.json').version}`, '#F999B3')}\n`);
    });
  };
};

(async (): Promise<void> => await new Client().load())();