import { Walker } from './walker';
import DocsProcessor from '../../../lib/DocsProcessor';

export class EnumWalker extends Walker {
  walk(): void {
    this.onTypeDeclaration?.(this.type);
  }
}
