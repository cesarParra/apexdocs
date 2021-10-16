import { Type } from '@cparra/apex-reflection';
import { Walker } from './walker';
import { ClassWalker } from './class-walker';
import { EnumWalker } from './enum-walker';
import { InterfaceWalker } from './interface-walker';

export class WalkerFactory {
  static get(type: Type): Walker {
    switch (type.type_name) {
      case 'class':
        return new ClassWalker(type);
      case 'enum':
        return new EnumWalker(type);
      case 'interface':
        return new InterfaceWalker(type);
    }
  }
}
