import { Event } from 'Event';

import { ClientEvents } from 'Root';

(async function (): Promise<void> {

  let events: string[] = load('./events/**/*.{ts,js}');

  if (events.length) {

    await Promise.all(events.map(async (file: string) => {

      let event: Event = new (await import(file)).default;

      if (!event.enabled) return;

      client.on(event.type, async (...items: ClientEvents[keyof ClientEvents]) => await event.execute(...items));
    }));
  };
})();