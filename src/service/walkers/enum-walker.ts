import { Walker, WalkerListener } from './walker';

export class EnumWalker extends Walker {
  walk(listener: WalkerListener): void {
    listener.onTypeDeclaration(this.type);
  }
}
