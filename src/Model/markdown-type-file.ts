import { File } from './file';
import { Type } from '@cparra/apex-reflection';
import Configuration from '../configuration';
import { WalkerFactory } from '../service/walkers/walker-factory';

export class MarkdownTypeFile extends File {
  _currentHeadingLevel: number;

  constructor(public fileName: string, public type: Type) {
    super(fileName);
    // TODO: onBeforeClassFileCreated
    this._currentHeadingLevel = Configuration.getConfig()?.content?.startingHeadingLevel || 1;
    this.initialize();

    const walker = WalkerFactory.get(type);
    walker.onTypeDeclaration = this.onTypeDeclaration;
    walker.walk();
  }

  private initialize() {
    Configuration.getConfig()?.content?.injections?.doc?.onInit?.forEach(injection => {
      this.addText(injection);
    });
  }

  private onTypeDeclaration(typeMirror: Type): void {
    // TODO
  }
}
