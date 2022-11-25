import { TypesRepository } from '../../../../model/types-repository';
import { ReferenceBuilder } from '../ReferenceBuilder';
import { ClassMirrorBuilder } from '../../../../test-helpers/ClassMirrorBuilder';
import { FieldMirrorBuilder } from '../../../../test-helpers/FieldMirrorBuilder';

describe('ReferenceBuilder', () => {
  describe('Validation', () => {
    it('should throw an error if the reference does not exist', function () {
      TypesRepository.getInstance = jest.fn().mockReturnValue({
        getFromAllByName: jest.fn().mockReturnValue(null),
      });

      expect(() => {
        new ReferenceBuilder().build('AnyName');
      }).toThrow(Error);
    });
  });

  describe('Filters out members', () => {
    it('should filter out static members', function () {
      const classMirror = new ClassMirrorBuilder()
        .addFiled(new FieldMirrorBuilder().addMemberModifier('static').build())
        .build();

      TypesRepository.getInstance = jest.fn().mockReturnValue({
        getFromAllByName: jest.fn().mockReturnValue(classMirror),
      });

      const result = new ReferenceBuilder().build('className');

      expect(result.referencedClass).toBe('className');
      expect(result.referenceObject.$ref).toBe('#/components/schemas/className');
      expect(result.schema.type).toBe('object');
      expect(result.schema.properties).toMatchObject({});
    });

    it('should filter out transient members', function () {
      const classMirror = new ClassMirrorBuilder()
        .addFiled(new FieldMirrorBuilder().addMemberModifier('transient').build())
        .build();

      TypesRepository.getInstance = jest.fn().mockReturnValue({
        getFromAllByName: jest.fn().mockReturnValue(classMirror),
      });

      const result = new ReferenceBuilder().build('className');

      expect(result.referencedClass).toBe('className');
      expect(result.referenceObject.$ref).toBe('#/components/schemas/className');
      expect(result.schema.type).toBe('object');
      expect(result.schema.properties).toMatchObject({});
    });

    it('should include private members', function () {
      const classMirror = new ClassMirrorBuilder()
        .addFiled(new FieldMirrorBuilder().withName('fieldName').withAccessModifier('private').build())
        .build();

      TypesRepository.getInstance = jest.fn().mockReturnValue({
        getFromAllByName: jest.fn().mockReturnValue(classMirror),
      });

      const result = new ReferenceBuilder().build('className');

      expect(result.referencedClass).toBe('className');
      expect(result.referenceObject.$ref).toBe('#/components/schemas/className');
      expect(result.schema.type).toBe('object');
      expect(result.schema.properties).toHaveProperty('fieldName');
    });

    it('should include protected members', function () {
      const classMirror = new ClassMirrorBuilder()
        .addFiled(new FieldMirrorBuilder().withName('fieldName').withAccessModifier('protected').build())
        .build();

      TypesRepository.getInstance = jest.fn().mockReturnValue({
        getFromAllByName: jest.fn().mockReturnValue(classMirror),
      });

      const result = new ReferenceBuilder().build('className');

      expect(result.referencedClass).toBe('className');
      expect(result.referenceObject.$ref).toBe('#/components/schemas/className');
      expect(result.schema.type).toBe('object');
      expect(result.schema.properties).toHaveProperty('fieldName');
    });

    it('should include public members', function () {
      const classMirror = new ClassMirrorBuilder()
        .addFiled(new FieldMirrorBuilder().withName('fieldName').withAccessModifier('public').build())
        .build();

      TypesRepository.getInstance = jest.fn().mockReturnValue({
        getFromAllByName: jest.fn().mockReturnValue(classMirror),
      });

      const result = new ReferenceBuilder().build('className');

      expect(result.referencedClass).toBe('className');
      expect(result.referenceObject.$ref).toBe('#/components/schemas/className');
      expect(result.schema.type).toBe('object');
      expect(result.schema.properties).toHaveProperty('fieldName');
    });

    it('should include global members', function () {
      const classMirror = new ClassMirrorBuilder()
        .addFiled(new FieldMirrorBuilder().withName('fieldName').withAccessModifier('global').build())
        .build();

      TypesRepository.getInstance = jest.fn().mockReturnValue({
        getFromAllByName: jest.fn().mockReturnValue(classMirror),
      });

      const result = new ReferenceBuilder().build('className');

      expect(result.referencedClass).toBe('className');
      expect(result.referenceObject.$ref).toBe('#/components/schemas/className');
      expect(result.schema.type).toBe('object');
      expect(result.schema.properties).toHaveProperty('fieldName');
    });
  });
});
