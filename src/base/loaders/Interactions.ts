import { App } from 'App';
import { Command } from 'Command';

import {
  ApplicationCommandData,
} from 'Root';

(async function (): Promise<void> {

  let interactions: ApplicationCommandData[] = [];

  let apps: string[] = load('./interactions/apps/*/*.{ts,js}');
  let commands: string[] = load('./interactions/commands/*/*.{ts,js}');

  if (apps.length) {

    await Promise.all(apps.map(async (file: string) => {

      let app: App = new (await import(file)).default;

      if (!app.enabled) return;

      interactions.push({
        name: app.name,
        dmPermission: false,
        type: app.type,
      });

      client.apps.set(app.name, app);
    }));
  };

  if (commands.length) {

    await Promise.all(commands.map(async (file: string) => {

      let command: Command = new (await import(file)).default;

      if (!command.enabled) return;

      interactions.push({
        name: command.name,
        description: command.description,
        options: command.options,
        dmPermission: false,
        type: 1,
      });

      client.commands.set(command.name, command);
    }));
  };

  await client.application.commands.set(interactions);
})();