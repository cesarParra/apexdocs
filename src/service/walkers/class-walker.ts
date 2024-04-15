import { Walker, WalkerListener } from './walker';
import { ClassMirror } from '@cparra/apex-reflection';

export class ClassWalker extends Walker {
  walk(listener: WalkerListener): void {
    listener.onTypeDeclaration(this.type);
    const classMirror = this.type as ClassMirror;
    if (classMirror.constructors.length) {
      listener.onConstructorDeclaration(this.type.name, classMirror.constructors);
    }
    if (classMirror.fields.length) {
      listener.onFieldsDeclaration(this.sortType(classMirror.fields));
    }
    if (classMirror.properties.length) {
      listener.onPropertiesDeclaration(this.sortType(classMirror.properties));
    }
    if (classMirror.methods.length) {
      listener.onMethodsDeclaration(this.sortType(classMirror.methods));
    }
    if (classMirror.enums.length) {
      listener.onInnerEnumsDeclaration(this.sortType(classMirror.enums));
    }
    if (classMirror.classes.length) {
      listener.onInnerClassesDeclaration(this.sortType(classMirror.classes));
    }
    if (classMirror.interfaces.length) {
      listener.onInnerInterfacesDeclaration(this.sortType(classMirror.interfaces));
    }
  }
}
