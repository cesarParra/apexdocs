import chalk from 'chalk';
import logUpdate from 'log-update';

/**
 * Logs messages to the console.
 */
export class Logger {
  static currentFrame = 0;

  static frames = ['⠋', '⠙', '⠹', '⠸', '⠼', '⠴', '⠦', '⠧', '⠇', '⠏'];

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
  public static error(message: string, ...args: string[]) {
    this.logSingle(message, false, 'red', false);
    args.forEach(() => {
      this.logSingle(message, false, 'red', false);
    });
  }

  public static logSingle(text: string, showSpinner = true, color: 'green' | 'red' = 'green', overrideConsole = true) {
    if (this.currentFrame > 9) {
      this.currentFrame = 0;
    }
    const spinner = showSpinner ? `${this.frames[this.currentFrame++]}` : '';
    let logMessage;
    if (color === 'green') {
      logMessage = `${chalk.green(new Date().toLocaleString() + ': ')}${text}\n`;
    } else {
      logMessage = `${chalk.red(new Date().toLocaleString() + ': ')}${text}\n`;
    }
    if (overrideConsole) {
      logUpdate(`${spinner} ${logMessage}`);
    } else {
      process.stdout.write(`${spinner} ${logMessage}`);
    }
  }

  public static clear() {
    logUpdate.clear();
  }
}
