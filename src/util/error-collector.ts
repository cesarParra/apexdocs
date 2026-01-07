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
  raw?: unknown;
  at?: string;
};

/**
 * Collects errors during a single generator run.
 */
export class ErrorCollector {
  private readonly generator: GeneratorName;
  private readonly items: ErrorItem[] = [];

  constructor(generator: GeneratorName) {
    this.generator = generator;
  }

  public add(item: Omit<ErrorItem, 'generator'>): void {
    const fullItem: ErrorItem = {
      generator: this.generator,
      at: item.at ?? new Date().toISOString(),
      ...item,
    };

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

  public count(): number {
    return this.items.length;
  }

  public all(): readonly ErrorItem[] {
    return this.items;
  }

  /**
   * Human-readable representation of the error item.
   */
  public static format(item: ErrorItem): string {
    const location = item.filePath ? `${item.filePath}` : '';
    return `[${item.generator}] ${location}: ${item.message}`;
  }
}
