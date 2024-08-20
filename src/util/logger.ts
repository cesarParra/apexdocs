import chalk from 'chalk';
/**
 * Logs messages to the console.
 */
export class Logger {
  static currentFrame = 0;

  /**
   * Logs a message with optional arguments.
   * @param message The message to log.
   * @param args Optional arguments.
   */
  public static log(message: string, ...args: string[]) {
    this.logSingle(message);
    args.forEach((arg) => {
      this.logSingle(arg);
    });
  }

  /**
   * Logs an error message with optional arguments.
   * @param message The error message to log.
   * @param args Optional arguments.
   */
  public static error(message: unknown, ...args: string[]) {
    this.logSingle(message, 'red');
    args.forEach(() => {
      this.logSingle(message, 'red');
    });
  }

  public static logSingle(text: unknown, color: 'green' | 'red' = 'green') {
    if (this.currentFrame > 9) {
      this.currentFrame = 0;
    }

    const logMessage = `${this.getChalkFn(color)(new Date().toLocaleString() + ': ')}${text}\n`;
    process.stdout.write(logMessage);
  }

  private static getChalkFn(color: 'green' | 'red') {
    return color === 'green' ? chalk.green : chalk.red;
  }
}
