import { FieldMirror } from '@cparra/apex-reflection';

type MemberModifier = 'static' | 'webservice' | 'final' | 'override' | 'testmethod' | 'transient';

export class FieldMirrorBuilder {
  private accessModifier = 'public';
  private name = 'fieldName';
  private memberModifiers: MemberModifier[] = [];

  withAccessModifier(accessModifier: string): FieldMirrorBuilder {
    this.accessModifier = accessModifier;
    return this;
  }

  withName(name: string): FieldMirrorBuilder {
    this.name = name;
    return this;
  }

  addMemberModifier(memberModifier: MemberModifier): FieldMirrorBuilder {
    this.memberModifiers.push(memberModifier);
    return this;
  }

  build(): FieldMirror {
    return {
      access_modifier: this.accessModifier,
      annotations: [],
      name: this.name,
      memberModifiers: this.memberModifiers,
      type: 'void',
    };
  }
}
