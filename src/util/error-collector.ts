export type GeneratorName = 'markdown' | 'openapi' | 'changelog';

export type ErrorStage =
  | 'apex'
  | 'trigger'
  | 'customobject'
  | 'customfield'
  | 'custommetadata'
  | 'lwc'
  | 'read'
  | 'write'
  | 'hook'
  | 'other';

export type ErrorItem = {
  generator: GeneratorName;
  stage: ErrorStage;
  filePath?: string;
  message: string;
  /**
   * Optional raw object for additional debugging if callers want to preserve it.
   * Not used for counting/deduping.
   */
  raw?: unknown;
  /**
   * Optional timestamp to help with debugging ordering. Not used for equality.
   */
  at?: string;
};

/**
 * Collects per-file (and other) error items during a single generator run.
 *
 * This is meant to be the source of truth for end-of-run error reporting,
 * so callers don't need to understand the varying shapes of internal error returns.
 */
export class ErrorCollector {
  private readonly generator: GeneratorName;
  private readonly items: ErrorItem[] = [];

  // Basic de-dupe to avoid double-recording the same failure if the same layer reports it twice.
  // Keyed by generator|stage|filePath|message.
  private readonly seen = new Set<string>();

  constructor(generator: GeneratorName) {
    this.generator = generator;
  }

  public add(item: Omit<ErrorItem, 'generator'>): void {
    const fullItem: ErrorItem = {
      generator: this.generator,
      at: item.at ?? new Date().toISOString(),
      ...item,
    };

    const key = [
      fullItem.generator,
      fullItem.stage,
      fullItem.filePath ?? '',
      // Normalize whitespace a bit so trivial formatting differences don't explode the log.
      (fullItem.message ?? '').trim().replace(/\s+/g, ' '),
    ].join('|');

    if (this.seen.has(key)) {
      return;
    }

    this.seen.add(key);
    this.items.push(fullItem);
  }

  public addFailure(stage: ErrorStage, filePath: string, message: string, raw?: unknown): void {
    this.add({
      stage,
      filePath,
      message,
      raw,
    });
  }

  public addGlobalFailure(stage: ErrorStage, message: string, raw?: unknown): void {
    this.add({
      stage,
      message,
      raw,
    });
  }

  public hasErrors(): boolean {
    return this.items.length > 0;
  }

  /** Count of collected error items (post de-duplication). */
  public count(): number {
    return this.items.length;
  }

  public all(): readonly ErrorItem[] {
    return this.items;
  }

  /**
   * Groups error items by file path. Items with no file path are grouped under `__global__`.
   */
  public groupByFilePath(): Record<string, ErrorItem[]> {
    return this.items.reduce<Record<string, ErrorItem[]>>((acc, item) => {
      const key = item.filePath ?? '__global__';
      acc[key] = acc[key] ?? [];
      acc[key].push(item);
      return acc;
    }, {});
  }

  /**
   * A compact human-readable representation of the error item.
   * Useful for CLI output.
   */
  public static format(item: ErrorItem): string {
    const location = item.filePath ? `${item.filePath}` : '(no file)';
    return `[${item.generator}] ${location}: ${item.message}`;
  }
}
