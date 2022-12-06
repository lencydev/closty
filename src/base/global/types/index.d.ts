import Config from 'Config';

import { Context } from 'Context';
import { Logger } from 'Logger';
import { Client } from 'Client';

import { Guild } from 'Root';

export declare global {

  var Color: typeof Config.Color;
  var Data: typeof Config.Data;
  var Emoji: typeof Config.Emoji;

  var ctx: Context;
  var logger: Logger;
  var client: Client;

  function load (path: `./${string}`): string[];
  function translate <Input extends TranslateString> (input: Input, guild: Guild, options: TOptions = {}): Promise<string>;
  function TextColor (text: any, hex: `#${string}` = '#FFFFFF', bold?: boolean): string;
};