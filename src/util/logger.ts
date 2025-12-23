import chalk from 'chalk';

export interface Logger {
  log(message: string, ...args: string[]): void;
  error(message: unknown, ...args: string[]): void;
  logSingle(text: unknown, color?: 'green' | 'red'): void;
  debug(message: unknown): void;
  setDebug(enabled: boolean): void;
  isDebugEnabled(): boolean;
}

/**
 * Logs messages to the console.
 */
export class StdOutLogger implements Logger {
  private debugEnabled = false;

  constructor(options?: { debug?: boolean }) {
    this.debugEnabled = options?.debug ?? false;
  }

  public setDebug(enabled: boolean) {
    this.debugEnabled = enabled;
  }

  public isDebugEnabled(): boolean {
    return this.debugEnabled;
  }

  public debug(message: unknown) {
    if (!this.debugEnabled) {
      return;
    }
    this.logSingle(`[debug] ${String(message)}`);
  }

  /**
   * Logs a message with optional arguments.
   * @param message The message to log.
   * @param args Optional arguments.
   */
  public log(message: string, ...args: string[]) {
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
  public error(message: unknown, ...args: string[]) {
    this.logSingle(message, 'red');
    args.forEach(() => {
      this.logSingle(message, 'red');
    });
  }

  public logSingle(text: unknown, color: 'green' | 'red' = 'green') {
    const logMessage = `${this.getChalkFn(color)(new Date().toLocaleString() + ': ')}${text}\n`;
    process.stdout.write(logMessage);
  }

  private getChalkFn(color: 'green' | 'red') {
    return color === 'green' ? chalk.green : chalk.red;
  }
}

export class NoLogger implements Logger {
  public setDebug(enabled: boolean): void {
    void enabled;
  }
  public isDebugEnabled(): boolean {
    return false;
  }
  public debug(message: unknown): void {
    void message;
  }
  public log(message: string, ...args: string[]): void {
    void message;
    void args;
  }
  public error(message: unknown, ...args: string[]): void {
    void message;
    void args;
  }
  public logSingle(text: unknown, color?: 'green' | 'red'): void {
    void text;
    void color;
  }
}
