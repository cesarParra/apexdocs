import { InterfaceMirror } from '@cparra/apex-reflection';
import { InterfaceSource } from '../templating/types';

export function interfaceTypeToInterfaceSource(interfaceType: InterfaceMirror): InterfaceSource {
  return {
    __type: 'interface',
    name: interfaceType.name,
    accessModifier: interfaceType.access_modifier,
  };
}
