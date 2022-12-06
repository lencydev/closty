import { CronJob } from 'cron';

import { Autorole } from 'Schemas';

(async function (): Promise<void> {

  new CronJob('0 */6 * * *', async () => {

    let autorole: Array<SchemaType<AutoroleSchema>> = await Autorole.find();

    await Promise.all(autorole.map(async (db: SchemaType<AutoroleSchema>) => {

      if (!db.roles.length) db.deleteOne();
    }));
  }).start();
})();