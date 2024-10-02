import process, { stdout } from 'node:process';

export interface UpdateOptions {
  frames?: string[];
  interval?: number;
  message?: string;
  template?: (animation?: string, message?: string) => string;
}

export interface StopOptions {
  mark?: string;
  message?: string;
  template?: (mark?: string, message?: string) => string;
}

export interface Options {
  /**
   * Specifies the frames to be used in the spinner animation.
   */
  frames?: string[];
  /**
   * Specifies the time delay (in ms) between each frame.
   */
  interval?: number;
  /**
   * Defines the _line_ template.
   *
   * Useful when you need to rearrange the position of the animation and message or change the template completely.
   */
  template?: (animation?: string, message?: string) => string;
  /**
   * Specifies global options for the `.start()` method.
   */
  start?: UpdateOptions;
  /**
   * Specifies global options for the `.stop()` method.
   */
  stop?: StopOptions;
  /**
   * Specifies global options for the Node `exit` event.
   *
   * It's activated when the user explicitly cancels the process in the terminal (`ctrl` + `c`).
   */
  cancel?: StopOptions;
}

export interface Spinner {
  /**
   * Starts the spinner.
   *
   * Also, it can customize spinner options individually.
   */
  start(options?: UpdateOptions): void;
  /**
   * Dynamically updates the spinner on the fly.
   *
   * Very useful when you want to change the message
   * or dynamics of other options before stopping the spinner.
   */
  update(options?: UpdateOptions): void;
  /**
   * Stops the spinner with a custom mark and message.
   *
   * Also, this method can be used as _success_, _warning_, _cancel_, _error_ or similar events,
   * since it is very customizable.
   */
  stop(options?: StopOptions): void;
}

const green = (v: string | number): string => `\x1B[32m${v}\x1B[39m`;
const red = (v: string | number): string => `\x1B[31m${v}\x1B[39m`;

/**
 * Creates a tiny and super customizable CLI spinner for Node.
 *
 * @example
 *
 * ```ts
 * import { createSpinner } from '@hypernym/spinner'
 *
 * const spinner = createSpinner()
 *
 * spinner.start()
 *
 * setTimeout(() => {
 *   spinner.stop()
 * }, 3000)
 * ```
 */
export function createSpinner(options: Options = {}): Spinner {
  const { frames, interval, template, start = {}, cancel = {}, stop = {} } = options;

  let _iteration = 0;
  let _interval = interval || 40;
  let _intervalId: NodeJS.Timeout;
  let _frames = frames || ['⠋', '⠙', '⠹', '⠸', '⠼', '⠴', '⠦', '⠧', '⠇', '⠏'];
  let _message = start.message || 'Loading...';
  let _template: Options['template'];

  const _cursor = {
    hide: () => stdout.write('\u001B[?25l'),
    show: () => stdout.write('\u001B[?25h'),
  };

  function _write(line: string): void {
    const isTerminal = /(\r?\n|\r)$/.test(line);

    stdout.cursorTo(0);
    stdout.write(line.trim());
    stdout.clearLine(1);
    stdout.write(isTerminal ? '\r\n' : '');
  }

  function _render(): void {
    const animation = _frames[_iteration++ % _frames.length];
    let line = `${green(animation)} ${_message}`;

    if (template) line = template(animation, _message);
    if (_template) line = _template(animation, _message);

    _write(line);
  }

  function _exit(): never {
    spinner.stop({
      mark: red('✖'),
      message: 'Cancelled!',
      ...cancel,
    });
    process.exit();
  }

  function _update(options?: UpdateOptions): void {
    _frames = options?.frames || _frames;
    _message = options?.message || _message;
    _template = options?.template || _template;
  }

  function _clear(int?: number): void {
    if (int) {
      _interval = int;
      clearInterval(_intervalId);
      _intervalId = setInterval(_render, _interval);
    }
  }

  const spinner: Spinner = {
    start(options) {
      _update(options);

      _cursor.hide();
      _intervalId = setInterval(_render, _interval);

      _clear(options?.interval);
    },

    update(options) {
      _update(options);
      _clear(options?.interval);
    },

    stop(options) {
      const mark = options?.mark || stop.mark || green('✔');
      const message = options?.message || stop.message || 'Done!';
      let line = `${mark} ${message}\n`;

      if (options?.template) line = `${options.template(mark, message)}\n`;

      _cursor.show();
      clearInterval(_intervalId);

      _write(line);
    },
  };

  process.on('SIGINT', _exit);
  process.on('SIGTERM', _exit);

  return spinner;
}
