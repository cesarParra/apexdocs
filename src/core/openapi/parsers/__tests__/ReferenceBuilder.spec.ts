import { TypesRepository } from '../../../../core/openapi/types-repository';
import { ReferenceBuilder } from '../ReferenceBuilder';
import { ClassMirrorBuilder } from '../../../../test-helpers/ClassMirrorBuilder';
import { FieldMirrorBuilder } from '../../../../test-helpers/FieldMirrorBuilder';
import { SchemaObjectArray, SchemaObjectObject } from '../../../../core/openapi/open-api-types';
import { DocCommentBuilder } from '../../../../test-helpers/DocCommentBuilder';
import { DocCommentAnnotationBuilder } from '../../../../test-helpers/DocCommentAnnotationBuilder';

describe('ReferenceBuilder', () => {
  describe('Validation', () => {
    it('should throw an error if the reference does not exist', function () {
      TypesRepository.getInstance = jest.fn().mockReturnValue({
        getFromAllByName: jest.fn().mockReturnValue(undefined),
      });

      expect(() => {
        new ReferenceBuilder().build('AnyName');
      }).toThrow(Error);
    });
  });

  describe('Filters out members', () => {
    it('should filter out static members', function () {
      const classMirror = new ClassMirrorBuilder()
        .withName('className')
        .addFiled(new FieldMirrorBuilder().addMemberModifier('static').build())
        .build();

      TypesRepository.getInstance = jest.fn().mockReturnValue({
        getFromAllByName: jest.fn().mockReturnValue({ type: classMirror, isChild: false }),
      });

      const result = new ReferenceBuilder().build('className');

      expect(result.referenceComponents).toHaveLength(1);
      expect(result.referenceComponents[0].referencedClass).toBe('className');
      expect(result.entrypointReferenceObject.$ref).toBe('#/components/schemas/className');
      expect((result.referenceComponents[0].schema as SchemaObjectObject).type).toBe('object');
      expect((result.referenceComponents[0].schema as SchemaObjectObject).properties).toMatchObject({});
    });

    it('should filter out transient members', function () {
      const classMirror = new ClassMirrorBuilder()
        .withName('className')
        .addFiled(new FieldMirrorBuilder().addMemberModifier('transient').build())
        .build();

      TypesRepository.getInstance = jest.fn().mockReturnValue({
        getFromAllByName: jest.fn().mockReturnValue({ type: classMirror, isChild: false }),
      });

      const result = new ReferenceBuilder().build('className');

      expect(result.referenceComponents).toHaveLength(1);
      expect(result.referenceComponents[0].referencedClass).toBe('className');
      expect(result.entrypointReferenceObject.$ref).toBe('#/components/schemas/className');
      expect((result.referenceComponents[0].schema as SchemaObjectObject).type).toBe('object');
      expect((result.referenceComponents[0].schema as SchemaObjectObject).properties).toMatchObject({});
    });

    it('should include private members', function () {
      const classMirror = new ClassMirrorBuilder()
        .withName('className')
        .addFiled(new FieldMirrorBuilder().withName('fieldName').withAccessModifier('private').build())
        .build();

      TypesRepository.getInstance = jest.fn().mockReturnValue({
        getFromAllByName: jest.fn().mockReturnValue({ type: classMirror, isChild: false }),
      });

      const result = new ReferenceBuilder().build('className');

      expect(result.referenceComponents).toHaveLength(1);
      expect(result.referenceComponents[0].referencedClass).toBe('className');
      expect(result.entrypointReferenceObject.$ref).toBe('#/components/schemas/className');
      expect((result.referenceComponents[0].schema as SchemaObjectObject).type).toBe('object');
      expect((result.referenceComponents[0].schema as SchemaObjectObject).properties).toHaveProperty('fieldName');
    });

    it('should include protected members', function () {
      const classMirror = new ClassMirrorBuilder()
        .withName('className')
        .addFiled(new FieldMirrorBuilder().withName('fieldName').withAccessModifier('protected').build())
        .build();

      TypesRepository.getInstance = jest.fn().mockReturnValue({
        getFromAllByName: jest.fn().mockReturnValue({ type: classMirror, isChild: false }),
      });

      const result = new ReferenceBuilder().build('className');

      expect(result.referenceComponents).toHaveLength(1);
      expect(result.referenceComponents[0].referencedClass).toBe('className');
      expect(result.entrypointReferenceObject.$ref).toBe('#/components/schemas/className');
      expect((result.referenceComponents[0].schema as SchemaObjectObject).type).toBe('object');
      expect((result.referenceComponents[0].schema as SchemaObjectObject).properties).toHaveProperty('fieldName');
    });

    it('should include public members', function () {
      const classMirror = new ClassMirrorBuilder()
        .withName('className')
        .addFiled(new FieldMirrorBuilder().withName('fieldName').withAccessModifier('public').build())
        .build();

      TypesRepository.getInstance = jest.fn().mockReturnValue({
        getFromAllByName: jest.fn().mockReturnValue({ type: classMirror, isChild: false }),
      });

      const result = new ReferenceBuilder().build('className');

      expect(result.referenceComponents).toHaveLength(1);
      expect(result.referenceComponents[0].referencedClass).toBe('className');
      expect(result.entrypointReferenceObject.$ref).toBe('#/components/schemas/className');
      expect((result.referenceComponents[0].schema as SchemaObjectObject).type).toBe('object');
      expect((result.referenceComponents[0].schema as SchemaObjectObject).properties).toHaveProperty('fieldName');
    });

    it('should include global members', function () {
      const classMirror = new ClassMirrorBuilder()
        .withName('className')
        .addFiled(new FieldMirrorBuilder().withName('fieldName').withAccessModifier('global').build())
        .build();

      TypesRepository.getInstance = jest.fn().mockReturnValue({
        getFromAllByName: jest.fn().mockReturnValue({ type: classMirror, isChild: false }),
      });

      const result = new ReferenceBuilder().build('className');

      expect(result.referenceComponents).toHaveLength(1);
      expect(result.referenceComponents[0].referencedClass).toBe('className');
      expect(result.entrypointReferenceObject.$ref).toBe('#/components/schemas/className');
      expect((result.referenceComponents[0].schema as SchemaObjectObject).type).toBe('object');
      expect((result.referenceComponents[0].schema as SchemaObjectObject).properties).toHaveProperty('fieldName');
    });
  });

  describe('Primitive Apex types are supported', () => {
    it('should correctly identify and parse Boolean fields', function () {
      const classMirror = new ClassMirrorBuilder()
        .addFiled(new FieldMirrorBuilder().withName('fieldName').withType('Boolean').build())
        .build();

      TypesRepository.getInstance = jest.fn().mockReturnValue({
        getFromAllByName: jest.fn().mockReturnValue({ type: classMirror, isChild: false }),
      });

      const result = new ReferenceBuilder().build('className');

      const schema = result.referenceComponents[0].schema as SchemaObjectObject;
      expect(schema.properties).toHaveProperty('fieldName');
      const fieldSchema = schema.properties!['fieldName'] as SchemaObjectObject;
      expect(fieldSchema.type).toBe('boolean');
    });

    it('should correctly identify and parse Date fields', function () {
      const classMirror = new ClassMirrorBuilder()
        .addFiled(new FieldMirrorBuilder().withName('fieldName').withType('Date').build())
        .build();

      TypesRepository.getInstance = jest.fn().mockReturnValue({
        getFromAllByName: jest.fn().mockReturnValue({ type: classMirror, isChild: false }),
      });

      const result = new ReferenceBuilder().build('className');

      const schema = result.referenceComponents[0].schema as SchemaObjectObject;
      expect(schema.properties).toHaveProperty('fieldName');
      const fieldSchema = schema.properties!['fieldName'] as SchemaObjectObject;
      expect(fieldSchema.type).toBe('string');
      expect(fieldSchema.format).toBe('date');
    });

    it('should correctly identify and parse Datetime fields', function () {
      const classMirror = new ClassMirrorBuilder()
        .addFiled(new FieldMirrorBuilder().withName('fieldName').withType('Datetime').build())
        .build();

      TypesRepository.getInstance = jest.fn().mockReturnValue({
        getFromAllByName: jest.fn().mockReturnValue({ type: classMirror, isChild: false }),
      });

      const result = new ReferenceBuilder().build('className');

      const schema = result.referenceComponents[0].schema as SchemaObjectObject;
      expect(schema.properties).toHaveProperty('fieldName');
      const fieldSchema = schema.properties!['fieldName'] as SchemaObjectObject;
      expect(fieldSchema.type).toBe('string');
      expect(fieldSchema.format).toBe('date-time');
    });

    it('should correctly identify and parse Decimal fields', function () {
      const classMirror = new ClassMirrorBuilder()
        .addFiled(new FieldMirrorBuilder().withName('fieldName').withType('Decimal').build())
        .build();

      TypesRepository.getInstance = jest.fn().mockReturnValue({
        getFromAllByName: jest.fn().mockReturnValue({ type: classMirror, isChild: false }),
      });

      const result = new ReferenceBuilder().build('className');

      const schema = result.referenceComponents[0].schema as SchemaObjectObject;
      expect(schema.properties).toHaveProperty('fieldName');
      const fieldSchema = schema.properties!['fieldName'] as SchemaObjectObject;
      expect(fieldSchema.type).toBe('number');
    });

    it('should correctly identify and parse Double fields', function () {
      const classMirror = new ClassMirrorBuilder()
        .addFiled(new FieldMirrorBuilder().withName('fieldName').withType('Double').build())
        .build();

      TypesRepository.getInstance = jest.fn().mockReturnValue({
        getFromAllByName: jest.fn().mockReturnValue({ type: classMirror, isChild: false }),
      });

      const result = new ReferenceBuilder().build('className');

      const schema = result.referenceComponents[0].schema as SchemaObjectObject;
      expect(schema.properties).toHaveProperty('fieldName');
      const fieldSchema = schema.properties!['fieldName'] as SchemaObjectObject;
      expect(fieldSchema.type).toBe('number');
    });

    it('should correctly identify and parse ID fields', function () {
      const classMirror = new ClassMirrorBuilder()
        .addFiled(new FieldMirrorBuilder().withName('fieldName').withType('ID').build())
        .build();

      TypesRepository.getInstance = jest.fn().mockReturnValue({
        getFromAllByName: jest.fn().mockReturnValue({ type: classMirror, isChild: false }),
      });

      const result = new ReferenceBuilder().build('className');

      const schema = result.referenceComponents[0].schema as SchemaObjectObject;
      expect(schema.properties).toHaveProperty('fieldName');
      const fieldSchema = schema.properties!['fieldName'] as SchemaObjectObject;
      expect(fieldSchema.type).toBe('string');
    });

    it('should correctly identify and parse Integer fields', function () {
      const classMirror = new ClassMirrorBuilder()
        .addFiled(new FieldMirrorBuilder().withName('fieldName').withType('Integer').build())
        .build();

      TypesRepository.getInstance = jest.fn().mockReturnValue({
        getFromAllByName: jest.fn().mockReturnValue({ type: classMirror, isChild: false }),
      });

      const result = new ReferenceBuilder().build('className');

      const schema = result.referenceComponents[0].schema as SchemaObjectObject;
      expect(schema.properties).toHaveProperty('fieldName');
      const fieldSchema = schema.properties!['fieldName'] as SchemaObjectObject;
      expect(fieldSchema.type).toBe('integer');
    });

    it('should correctly identify and parse Long fields', function () {
      const classMirror = new ClassMirrorBuilder()
        .addFiled(new FieldMirrorBuilder().withName('fieldName').withType('Long').build())
        .build();

      TypesRepository.getInstance = jest.fn().mockReturnValue({
        getFromAllByName: jest.fn().mockReturnValue({ type: classMirror, isChild: false }),
      });

      const result = new ReferenceBuilder().build('className');

      const schema = result.referenceComponents[0].schema as SchemaObjectObject;
      expect(schema.properties).toHaveProperty('fieldName');
      const fieldSchema = schema.properties!['fieldName'] as SchemaObjectObject;
      expect(fieldSchema.type).toBe('integer');
      expect(fieldSchema.format).toBe('int64');
    });

    it('should correctly identify and parse String fields', function () {
      const classMirror = new ClassMirrorBuilder()
        .addFiled(new FieldMirrorBuilder().withName('fieldName').withType('String').build())
        .build();

      TypesRepository.getInstance = jest.fn().mockReturnValue({
        getFromAllByName: jest.fn().mockReturnValue({ type: classMirror, isChild: false }),
      });

      const result = new ReferenceBuilder().build('className');

      const schema = result.referenceComponents[0].schema as SchemaObjectObject;
      expect(schema.properties).toHaveProperty('fieldName');
      const fieldSchema = schema.properties!['fieldName'] as SchemaObjectObject;
      expect(fieldSchema.type).toBe('string');
    });

    it('should correctly identify and parse Time fields', function () {
      const classMirror = new ClassMirrorBuilder()
        .addFiled(new FieldMirrorBuilder().withName('fieldName').withType('Time').build())
        .build();

      TypesRepository.getInstance = jest.fn().mockReturnValue({
        getFromAllByName: jest.fn().mockReturnValue({ type: classMirror, isChild: false }),
      });

      const result = new ReferenceBuilder().build('className');

      const schema = result.referenceComponents[0].schema as SchemaObjectObject;
      expect(schema.properties).toHaveProperty('fieldName');
      const fieldSchema = schema.properties!['fieldName'] as SchemaObjectObject;
      expect(fieldSchema.type).toBe('string');
      expect(fieldSchema.format).toBe('time');
    });
  });

  describe('Collection of primitives are supported', () => {
    it('should correctly identify and parse a list of primitive fields', function () {
      const classMirror = new ClassMirrorBuilder()
        .addFiled(
          new FieldMirrorBuilder()
            .withName('fieldName')
            .withReferencedType({
              type: 'List',
              rawDeclaration: 'List<Boolean>',
              ofType: {
                type: 'Boolean',
                rawDeclaration: 'Boolean',
              },
            })
            .build(),
        )
        .build();

      TypesRepository.getInstance = jest.fn().mockReturnValue({
        getFromAllByName: jest.fn().mockReturnValue({ type: classMirror, isChild: false }),
      });

      const result = new ReferenceBuilder().build('className');

      const schema = result.referenceComponents[0].schema as SchemaObjectObject;
      expect(schema.properties).toHaveProperty('fieldName');

      const fieldSchema = schema.properties!['fieldName'] as SchemaObjectArray;
      expect(fieldSchema.type).toBe('array');

      const collectionOf = fieldSchema.items as SchemaObjectObject;
      expect(collectionOf.type).toBe('boolean');
    });

    it('should correctly identify and parse a set of primitive fields', function () {
      const classMirror = new ClassMirrorBuilder()
        .addFiled(
          new FieldMirrorBuilder()
            .withName('fieldName')
            .withReferencedType({
              type: 'Set',
              rawDeclaration: 'List<String>',
              ofType: {
                type: 'String',
                rawDeclaration: 'String',
              },
            })
            .build(),
        )
        .build();

      TypesRepository.getInstance = jest.fn().mockReturnValue({
        getFromAllByName: jest.fn().mockReturnValue({ type: classMirror, isChild: false }),
      });

      const result = new ReferenceBuilder().build('className');

      const schema = result.referenceComponents[0].schema as SchemaObjectObject;
      expect(schema.properties).toHaveProperty('fieldName');

      const fieldSchema = schema.properties!['fieldName'] as SchemaObjectArray;
      expect(fieldSchema.type).toBe('array');

      const collectionOf = fieldSchema.items as SchemaObjectObject;
      expect(collectionOf.type).toBe('string');
    });

    it('should correctly identify and parse a map of primitive fields', function () {
      const classMirror = new ClassMirrorBuilder()
        .addFiled(
          new FieldMirrorBuilder()
            .withName('fieldName')
            .withReferencedType({
              type: 'Map',
              rawDeclaration: 'Map<String, Boolean>',
              keyType: {
                type: 'String',
                rawDeclaration: 'String',
              },
              valueType: {
                type: 'Boolean',
                rawDeclaration: 'Boolean',
              },
            })
            .build(),
        )
        .build();

      TypesRepository.getInstance = jest.fn().mockReturnValue({
        getFromAllByName: jest.fn().mockReturnValue({ type: classMirror, isChild: false }),
      });

      const result = new ReferenceBuilder().build('className');

      const schema = result.referenceComponents[0].schema as SchemaObjectObject;
      expect(schema.properties).toHaveProperty('fieldName');

      const fieldSchema = schema.properties!['fieldName'] as SchemaObjectObject;
      expect(fieldSchema.type).toBe('object');
    });
  });

  describe('References to other references', () => {
    it('should parse references to another reference', function () {
      const mainClassMirror = new ClassMirrorBuilder()
        .withName('parent')
        .addFiled(
          new FieldMirrorBuilder()
            .withName('childClassMember')
            .withReferencedType({
              type: 'ChildClass',
              rawDeclaration: 'ChildClass',
            })
            .build(),
        )
        .build();

      const childClass = new ClassMirrorBuilder()
        .withName('child')
        .addFiled(new FieldMirrorBuilder().withName('stringMember').withType('String').build())
        .build();

      TypesRepository.getInstance = jest.fn().mockReturnValue({
        getFromAllByName: jest
          .fn()
          .mockReturnValueOnce({ type: mainClassMirror, isChild: false })
          .mockReturnValueOnce({ type: childClass, isChild: false }),
      });

      const result = new ReferenceBuilder().build('className');

      expect(result.referenceComponents).toHaveLength(2);
      expect(result.referenceComponents.some((ref) => ref.referencedClass === 'parent')).toBe(true);
      expect(result.referenceComponents.some((ref) => ref.referencedClass === 'child')).toBe(true);
    });

    it('should parse references to multiple other references', function () {
      const mainClassMirror = new ClassMirrorBuilder()
        .withName('parent')
        .addFiled(
          new FieldMirrorBuilder()
            .withName('childClassMember')
            .withReferencedType({
              type: 'ChildClass',
              rawDeclaration: 'ChildClass',
            })
            .build(),
        )
        .addFiled(
          new FieldMirrorBuilder()
            .withName('anotherChildClassMember')
            .withReferencedType({
              type: 'AnotherChildClass',
              rawDeclaration: 'AnotherChildClass',
            })
            .build(),
        )
        .build();

      const oneChild = new ClassMirrorBuilder()
        .withName('onechild')
        .addFiled(new FieldMirrorBuilder().withName('stringMember').withType('String').build())
        .build();

      const anotherChild = new ClassMirrorBuilder()
        .withName('anotherchild')
        .addFiled(new FieldMirrorBuilder().withName('stringMember').withType('String').build())
        .build();

      TypesRepository.getInstance = jest.fn().mockReturnValue({
        getFromAllByName: jest
          .fn()
          .mockReturnValueOnce({ type: mainClassMirror, isChild: false })
          .mockReturnValueOnce({ type: oneChild, isChild: false })
          .mockReturnValueOnce({ type: anotherChild, isChild: false }),
      });

      const result = new ReferenceBuilder().build('className');

      expect(result.referenceComponents).toHaveLength(3);
      expect(result.referenceComponents.some((ref) => ref.referencedClass === 'parent')).toBe(true);
      expect(result.referenceComponents.some((ref) => ref.referencedClass === 'onechild')).toBe(true);
      expect(result.referenceComponents.some((ref) => ref.referencedClass === 'anotherchild')).toBe(true);
    });

    it('should parse references to collections of other references', function () {
      const mainClassMirror = new ClassMirrorBuilder()
        .withName('parent')
        .addFiled(
          new FieldMirrorBuilder()
            .withName('collectionOfChildren')
            .withReferencedType({
              type: 'Set',
              rawDeclaration: 'List<ChildClass>',
              ofType: {
                type: 'ChildClass',
                rawDeclaration: 'List<ChildClass>',
              },
            })
            .build(),
        )
        .build();

      const childClass = new ClassMirrorBuilder()
        .withName('childclass')
        .addFiled(new FieldMirrorBuilder().withName('stringMember').withType('String').build())
        .build();

      TypesRepository.getInstance = jest.fn().mockReturnValue({
        getFromAllByName: jest
          .fn()
          .mockReturnValueOnce({ type: mainClassMirror, isChild: false })
          .mockReturnValueOnce({ type: childClass, isChild: false }),
      });

      const result = new ReferenceBuilder().build('className');

      expect(result.referenceComponents).toHaveLength(2);
      expect(result.referenceComponents.some((ref) => ref.referencedClass === 'parent')).toBe(true);
      expect(result.referenceComponents.some((ref) => ref.referencedClass === 'childclass')).toBe(true);
    });

    it('should parse multiple levels of references', function () {
      const mainClassMirror = new ClassMirrorBuilder()
        .withName('parent')
        .addFiled(
          new FieldMirrorBuilder()
            .withName('childClassMember')
            .withReferencedType({
              type: 'ChildClass',
              rawDeclaration: 'ChildClass',
            })
            .build(),
        )
        .build();

      const childClass = new ClassMirrorBuilder()
        .withName('child')
        .addFiled(
          new FieldMirrorBuilder()
            .withName('grandChildClassMember')
            .withReferencedType({
              type: 'GrandChildClass',
              rawDeclaration: 'GrandChildClass',
            })
            .build(),
        )
        .build();

      const grandChildClass = new ClassMirrorBuilder()
        .withName('grandchild')
        .addFiled(new FieldMirrorBuilder().withName('stringMember').withType('String').build())
        .build();

      TypesRepository.getInstance = jest.fn().mockReturnValue({
        getFromAllByName: jest
          .fn()
          .mockReturnValueOnce({ type: mainClassMirror, isChild: false })
          .mockReturnValueOnce({ type: childClass, isChild: false })
          .mockReturnValueOnce({ type: grandChildClass, isChild: false }),
      });

      const result = new ReferenceBuilder().build('className');

      expect(result.referenceComponents).toHaveLength(3);
      expect(result.referenceComponents.some((ref) => ref.referencedClass === 'parent')).toBe(true);
      expect(result.referenceComponents.some((ref) => ref.referencedClass === 'child')).toBe(true);
      expect(result.referenceComponents.some((ref) => ref.referencedClass === 'grandchild')).toBe(true);
    });
  });

  describe('References to collections', () => {
    it('should resolve references to lists', function () {
      const classMirror = new ClassMirrorBuilder()
        .withName('classname')
        .addFiled(new FieldMirrorBuilder().withName('fieldName').withAccessModifier('public').build())
        .build();

      TypesRepository.getInstance = jest.fn().mockReturnValue({
        getFromAllByName: jest.fn().mockReturnValue({ type: classMirror, isChild: false }),
      });

      const result = new ReferenceBuilder().build('List<classname>');

      expect(result.referenceComponents).toHaveLength(2);
      expect(result.referenceComponents[0].referencedClass).toBe('classname_array');
      expect(result.entrypointReferenceObject.$ref).toBe('#/components/schemas/classname_array');
      expect((result.referenceComponents[0].schema as SchemaObjectArray).type).toBe('array');
      expect((result.referenceComponents[1].schema as SchemaObjectObject).properties).toHaveProperty('fieldName');
    });

    it('should resolve references to sets', function () {
      const classMirror = new ClassMirrorBuilder()
        .withName('classname')
        .addFiled(new FieldMirrorBuilder().withName('fieldName').withAccessModifier('public').build())
        .build();

      TypesRepository.getInstance = jest.fn().mockReturnValue({
        getFromAllByName: jest.fn().mockReturnValue({ type: classMirror, isChild: false }),
      });

      const result = new ReferenceBuilder().build('Set<classname>');

      expect(result.referenceComponents).toHaveLength(2);
      expect(result.referenceComponents[0].referencedClass).toBe('classname_array');
      expect(result.entrypointReferenceObject.$ref).toBe('#/components/schemas/classname_array');
      expect((result.referenceComponents[0].schema as SchemaObjectArray).type).toBe('array');
      expect((result.referenceComponents[1].schema as SchemaObjectObject).properties).toHaveProperty('fieldName');
    });
  });

  describe('References can override their type', () => {
    it('should correctly parse a reference with an overridden reference', function () {
      const classMirror = new ClassMirrorBuilder()
        .addFiled(
          new FieldMirrorBuilder()
            .withName('fieldName')
            .withType('Object')
            .withDocComment(
              new DocCommentBuilder()
                .addAnnotation(
                  new DocCommentAnnotationBuilder().withName('http-schema').withBodyLines(['type: string']).build(),
                )
                .build(),
            )
            .build(),
        )
        .build();

      TypesRepository.getInstance = jest.fn().mockReturnValue({
        getFromAllByName: jest.fn().mockReturnValue({ type: classMirror, isChild: false }),
      });

      const result = new ReferenceBuilder().build('className');

      const schema = result.referenceComponents[0].schema as SchemaObjectObject;
      expect(schema.properties).toHaveProperty('fieldName');
      const fieldSchema = schema.properties!['fieldName'] as SchemaObjectObject;
      expect(fieldSchema.type).toBe('string');
    });

    it('should correctly parse a manually defined reference while parsing properties', function () {
      const mainClassMirror = new ClassMirrorBuilder()
        .withName('parent')
        .addFiled(
          new FieldMirrorBuilder()
            .withName('childClassMember')
            .withType('Object')
            .withDocComment(
              new DocCommentBuilder()
                .addAnnotation(
                  new DocCommentAnnotationBuilder().withName('http-schema').withBodyLines(['ChildClass']).build(),
                )
                .build(),
            )
            .build(),
        )
        .build();

      const childClass = new ClassMirrorBuilder()
        .withName('child')
        .addFiled(
          new FieldMirrorBuilder()
            .withName('grandChildClassMember')
            .withReferencedType({
              type: 'GrandChildClass',
              rawDeclaration: 'GrandChildClass',
            })
            .build(),
        )
        .build();

      const grandChildClass = new ClassMirrorBuilder()
        .withName('grandchild')
        .addFiled(new FieldMirrorBuilder().withName('stringMember').withType('String').build())
        .build();

      TypesRepository.getInstance = jest.fn().mockReturnValue({
        getFromAllByName: jest
          .fn()
          .mockReturnValueOnce({ type: mainClassMirror, isChild: false })
          .mockReturnValueOnce({ type: childClass, isChild: false })
          .mockReturnValueOnce({ type: grandChildClass, isChild: false }),
      });

      const result = new ReferenceBuilder().build('className');

      expect(result.referenceComponents).toHaveLength(3);
      expect(result.referenceComponents.some((ref) => ref.referencedClass === 'parent')).toBe(true);
      expect(result.referenceComponents.some((ref) => ref.referencedClass === 'child')).toBe(true);
      expect(result.referenceComponents.some((ref) => ref.referencedClass === 'grandchild')).toBe(true);
    });

    it('should correctly parse a referenced property overridden inline', function () {
      const mainClassMirror = new ClassMirrorBuilder()
        .withName('parent')
        .addFiled(new FieldMirrorBuilder().withName('childClassMember').withType('Object').build())
        .build();

      const childClass = new ClassMirrorBuilder()
        .withName('child')
        .addFiled(
          new FieldMirrorBuilder()
            .withName('grandChildClassMember')
            .withReferencedType({
              type: 'GrandChildClass',
              rawDeclaration: 'GrandChildClass',
            })
            .build(),
        )
        .build();

      const grandChildClass = new ClassMirrorBuilder()
        .withName('grandchild')
        .addFiled(new FieldMirrorBuilder().withName('stringMember').withType('String').build())
        .build();

      TypesRepository.getInstance = jest.fn().mockReturnValue({
        getFromAllByName: jest
          .fn()
          .mockReturnValueOnce({ type: mainClassMirror, isChild: false })
          .mockReturnValueOnce({ type: childClass, isChild: false })
          .mockReturnValueOnce({ type: grandChildClass, isChild: false }),
      });

      const result = new ReferenceBuilder().build('className[childClassMember:ChildClass]');

      expect(result.referenceComponents).toHaveLength(3);
      expect(
        result.referenceComponents.some(
          (ref) => ref.referencedClass === 'parent_className[childClassMember:ChildClass]',
        ),
      ).toBe(true);
      expect(result.referenceComponents.some((ref) => ref.referencedClass === 'child')).toBe(true);
      expect(result.referenceComponents.some((ref) => ref.referencedClass === 'grandchild')).toBe(true);
    });
  });
});
