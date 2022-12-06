import chalk from 'chalk';
import moment from 'moment-timezone';

export class Logger {

  readonly send;

  constructor () {

    this.send = function (message: string, options: LoggerOptions = { type: 0 }): void {

      const {
        type,
      } = options;

      let time = (): string => chalk.bold.hex('#FFFFFF')(`${moment().format('YYYY-MM-DD HH:mm:ss')} |`);

      let types: { [index in Numbers<0, 5>]: string; } = {
        0: '',
        1: chalk.bold.hex('#59ED6A')('SUCCESS'),
        2: chalk.bold.hex('#ED5959')('ERROR'),
        3: chalk.bold.hex('#59BAED')('INFO'),
        4: chalk.bold.hex('#EDA659')('WARN'),
      };

      return console.log(`${time()}${type ? ` ${types[type]}` : ``} ${message}`);
    };
  };
};