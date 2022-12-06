import Config from 'Config';

import { Context } from 'Context';
import { Logger } from 'Logger';

import { sync } from 'fast-glob';
import chalk from 'chalk';

import { Guild } from 'Root';

import i18next, { TOptions } from 'i18next';

import { Language } from 'Schemas';

(async function (): Promise<void> {

  global.Color = Config.Color;
  global.Data = Config.Data;
  global.Emoji = Config.Emoji;

  global.ctx = new Context();
  global.logger = new Logger();

  global.load = function (path: `./${string}`): string[] {

    return sync(`./${process.env.NODE_ENV}/${path}`, { absolute: true });
  };

  global.translate = async function <Input extends TranslateString> (input: Input, guild: Guild, options: TOptions = {}): Promise<string> {

    let { language = 'en-US' } = await Language.findOne({ guild: guild.id }) || {};

    return await i18next.t(input, { lng: language, ...options });
  };

  global.TextColor = function (text: any, hex: `#${string}` = '#FFFFFF', bold?: boolean): string {

    return bold ? chalk.bold.hex(hex)(text) : chalk.hex(hex)(text);
  };
})();