import { Walker, WalkerListener } from './walker';
import { ClassMirror } from '@cparra/apex-reflection';

export class ClassWalker extends Walker {
  walk(listener: WalkerListener): void {
    const classMirror = this.type as ClassMirror;
    if (classMirror.annotations.length) {
      listener.onAnnotationsDeclaration(classMirror.annotations);
    }

    listener.onTypeDeclaration(this.type);

    if (classMirror.constructors.length) {
      listener.onConstructorDeclaration(this.type.name, classMirror.constructors);
    }
    if (classMirror.fields.length) {
      listener.onFieldsDeclaration(classMirror.fields);
    }
    if (classMirror.properties.length) {
      listener.onPropertiesDeclaration(classMirror.properties);
    }
    if (classMirror.methods.length) {
      listener.onMethodsDeclaration(classMirror.methods);
    }
    if (classMirror.enums.length) {
      listener.onInnerEnumsDeclaration(classMirror.enums);
    }
    if (classMirror.classes.length) {
      listener.onInnerClassesDeclaration(classMirror.classes);
    }
    if (classMirror.interfaces.length) {
      listener.onInnerInterfacesDeclaration(classMirror.interfaces);
    }
  }
}
