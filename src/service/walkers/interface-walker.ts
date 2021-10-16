import { Walker, WalkerListener } from './walker';
import { InterfaceMirror } from '@cparra/apex-reflection';

export class InterfaceWalker extends Walker {
  walk(listener: WalkerListener): void {
    const interfaceMirror = this.type as InterfaceMirror;
    if (interfaceMirror.annotations.length) {
      listener.onAnnotationsDeclaration(interfaceMirror.annotations);
    }

    listener.onTypeDeclaration(this.type);

    if (interfaceMirror.methods.length) {
      listener.onMethodsDeclaration(interfaceMirror.methods);
    }
  }
}
