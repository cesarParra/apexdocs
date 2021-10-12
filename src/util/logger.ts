import * as chalk from 'chalk';

/**
 * Logs messages to the console.
 */
export class Logger {
  /**
   * Logs a message with optional arguments.
   * @param message The message to log.
   * @param args Optional arguments.
   */
  public static log(message: string, ...args: string[]) {
    this.logSingle(message);
    args.forEach(arg => {
      this.logSingle(arg);
    });
  }

  /**
   * Logs an error message with optional arguments.
   * @param message The error message to log.
   * @param args Optional arguments.
   */
  public static error(message: string, ...args: string[]) {
    this.log(`${chalk.red(message)}`, ...args);
  }

  private static logSingle(message: string) {
    process.stdout.write(
      `${chalk.green(new Date().toLocaleString() + ': ')}${message}\n`,
    );
  }
}
