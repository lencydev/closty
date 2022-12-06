import i18next, { Resource } from 'i18next';

(async function (): Promise<void> {

  let resources: Resource = {};

  let languages: string[] = load('./base/languages/*.{ts,js}');

  if (languages.length) {

    await Promise.all(languages.map(async (file: string) => {

      let language: string = file.split(`languages/`)[1].split(`.`)[0];

      resources[language] = {
        translation: (await import(file)).default,
      };
    }));
  };

  await i18next.init({
    resources,
    fallbackLng: 'en-US',
    interpolation: {
      prefix: `{`,
      suffix: `}`,
    },
  });

  client.languages = Object.keys(i18next.services.resourceStore.data);
})();