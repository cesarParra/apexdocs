import { Type } from '@cparra/apex-reflection';

type TypeDeclarationListener = (typeMirror: Type) => void;

export abstract class Walker {
  constructor(public type: Type) {
  }

  abstract walk(): void;

  onTypeDeclaration?: TypeDeclarationListener;
}
