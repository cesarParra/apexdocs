import { Walker, WalkerListener } from './walker';
import { EnumMirror } from '@cparra/apex-reflection';

export class EnumWalker extends Walker {
  walk(listener: WalkerListener): void {
    listener.onTypeDeclaration(this.type);
  }
}
