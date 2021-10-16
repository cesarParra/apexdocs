import { Walker, WalkerListener } from './walker';
import { InterfaceMirror } from '@cparra/apex-reflection';

export class InterfaceWalker extends Walker {
  walk(listener: WalkerListener): void {
    listener.onTypeDeclaration(this.type);
    const interfaceMirror = this.type as InterfaceMirror;
    if (interfaceMirror.methods.length) {
      listener.onMethodsDeclaration(interfaceMirror.methods);
    }
  }
}
