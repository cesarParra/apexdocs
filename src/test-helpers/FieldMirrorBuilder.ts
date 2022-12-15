import { DocComment, FieldMirror } from '@cparra/apex-reflection';
import { ReferencedType } from '@cparra/apex-reflection/index';

type MemberModifier = 'static' | 'webservice' | 'final' | 'override' | 'testmethod' | 'transient';

export class FieldMirrorBuilder {
  private docComment: DocComment | undefined = undefined;
  private accessModifier = 'public';
  private name = 'fieldName';
  private memberModifiers: MemberModifier[] = [];
  private type: ReferencedType = {
    type: 'String',
    rawDeclaration: 'String',
  };

  withAccessModifier(accessModifier: string): FieldMirrorBuilder {
    this.accessModifier = accessModifier;
    return this;
  }

  withName(name: string): FieldMirrorBuilder {
    this.name = name;
    return this;
  }

  withType(type: string): FieldMirrorBuilder {
    this.type = {
      rawDeclaration: type,
      type: type,
    };
    return this;
  }

  withReferencedType(type: ReferencedType): FieldMirrorBuilder {
    this.type = type;
    return this;
  }

  addMemberModifier(memberModifier: MemberModifier): FieldMirrorBuilder {
    this.memberModifiers.push(memberModifier);
    return this;
  }

  withDocComment(docComment: DocComment): FieldMirrorBuilder {
    this.docComment = docComment;
    return this;
  }

  build(): FieldMirror {
    return {
      access_modifier: this.accessModifier,
      annotations: [],
      name: this.name,
      memberModifiers: this.memberModifiers,
      typeReference: this.type,
      docComment: this.docComment,
    };
  }
}
