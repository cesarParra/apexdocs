import { Walker, WalkerListener } from './walker';

export class EnumWalker extends Walker {
  walk(listener: WalkerListener): void {
    // TODO: Sort here as well
    listener.onTypeDeclaration(this.type);
  }
}
