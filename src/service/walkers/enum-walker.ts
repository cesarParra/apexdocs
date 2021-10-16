import { Walker, WalkerListener } from './walker';
import { EnumMirror } from '@cparra/apex-reflection';

export class EnumWalker extends Walker {
  walk(listener: WalkerListener): void {
    const enumMirror = this.type as EnumMirror;
    if (enumMirror.annotations.length) {
      listener.onAnnotationsDeclaration(enumMirror.annotations);
    }

    listener.onTypeDeclaration(this.type);
  }
}
