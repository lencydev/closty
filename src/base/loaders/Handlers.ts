import { Handler } from 'Handler';

import { ClientEvents } from 'Root';

(async function (): Promise<void> {

  let handlers: string[] = load('./base/handlers/*.{ts,js}');

  if (handlers.length) {

    await Promise.all(handlers.map(async (file: string) => {

      let handler: Handler = new (await import(file)).default;

      if (!handler.enabled) return;

      client.on(handler.type, async (...items: ClientEvents[keyof ClientEvents]) => await handler.execute(...items));
    }));
  };
})();