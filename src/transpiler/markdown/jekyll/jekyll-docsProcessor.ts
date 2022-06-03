import { MarkdownTranspilerBase } from '../markdown-transpiler-base';
import { Type } from '@cparra/apex-reflection';
import { MarkdownHomeFile } from '../../../model/markdown-home-file';
import { MarkdownTypeFile } from '../../../model/markdown-type-file';
import { LinkingStrategy } from '../../processor-type-transpiler';

export class JekyllDocsProcessor extends MarkdownTranspilerBase {
  homeFileName(): string {
    return 'index';
  }

  onBeforeProcess = (types: Type[]) => {
    this._fileContainer.pushFile(new MarkdownHomeFile(this.homeFileName(), types, this.frontMatterHeader));
  };

  onProcess(type: Type): void {
    this._fileContainer.pushFile(new MarkdownTypeFile(type, 1, this.frontMatterHeader));
  }

  get frontMatterHeader(): string {
    return '---\nlayout: default\n---';
  }

  getLinkingStrategy(): LinkingStrategy {
    return 'path-relative';
  }
}
