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

  describe('Primitive Apex types are supported', () => {
    it('should correctly identify and parse Boolean fields', function () {
      const classMirror = new ClassMirrorBuilder()
        .addFiled(new FieldMirrorBuilder().withName('fieldName').withType('Boolean').build())
        .build();

      TypesRepository.getInstance = jest.fn().mockReturnValue({
        getFromAllByName: jest.fn().mockReturnValue(classMirror),
      });

      const result = new ReferenceBuilder().build('className');

      expect(result.schema.properties).toHaveProperty('fieldName');
      expect(result.schema.properties!['fieldName'].type).toBe('boolean');
    });

    it('should correctly identify and parse Date fields', function () {
      const classMirror = new ClassMirrorBuilder()
        .addFiled(new FieldMirrorBuilder().withName('fieldName').withType('Date').build())
        .build();

      TypesRepository.getInstance = jest.fn().mockReturnValue({
        getFromAllByName: jest.fn().mockReturnValue(classMirror),
      });

      const result = new ReferenceBuilder().build('className');

      expect(result.schema.properties).toHaveProperty('fieldName');
      expect(result.schema.properties!['fieldName'].type).toBe('string');
      expect(result.schema.properties!['fieldName'].format).toBe('date');
    });

    it('should correctly identify and parse Datetime fields', function () {
      const classMirror = new ClassMirrorBuilder()
        .addFiled(new FieldMirrorBuilder().withName('fieldName').withType('Datetime').build())
        .build();

      TypesRepository.getInstance = jest.fn().mockReturnValue({
        getFromAllByName: jest.fn().mockReturnValue(classMirror),
      });

      const result = new ReferenceBuilder().build('className');

      expect(result.schema.properties).toHaveProperty('fieldName');
      expect(result.schema.properties!['fieldName'].type).toBe('string');
      expect(result.schema.properties!['fieldName'].format).toBe('date-time');
    });

    it('should correctly identify and parse Decimal fields', function () {
      const classMirror = new ClassMirrorBuilder()
        .addFiled(new FieldMirrorBuilder().withName('fieldName').withType('Decimal').build())
        .build();

      TypesRepository.getInstance = jest.fn().mockReturnValue({
        getFromAllByName: jest.fn().mockReturnValue(classMirror),
      });

      const result = new ReferenceBuilder().build('className');

      expect(result.schema.properties).toHaveProperty('fieldName');
      expect(result.schema.properties!['fieldName'].type).toBe('number');
    });

    it('should correctly identify and parse Double fields', function () {
      const classMirror = new ClassMirrorBuilder()
        .addFiled(new FieldMirrorBuilder().withName('fieldName').withType('Double').build())
        .build();

      TypesRepository.getInstance = jest.fn().mockReturnValue({
        getFromAllByName: jest.fn().mockReturnValue(classMirror),
      });

      const result = new ReferenceBuilder().build('className');

      expect(result.schema.properties).toHaveProperty('fieldName');
      expect(result.schema.properties!['fieldName'].type).toBe('number');
    });

    it('should correctly identify and parse ID fields', function () {
      const classMirror = new ClassMirrorBuilder()
        .addFiled(new FieldMirrorBuilder().withName('fieldName').withType('ID').build())
        .build();

      TypesRepository.getInstance = jest.fn().mockReturnValue({
        getFromAllByName: jest.fn().mockReturnValue(classMirror),
      });

      const result = new ReferenceBuilder().build('className');

      expect(result.schema.properties).toHaveProperty('fieldName');
      expect(result.schema.properties!['fieldName'].type).toBe('string');
    });

    it('should correctly identify and parse Integer fields', function () {
      const classMirror = new ClassMirrorBuilder()
        .addFiled(new FieldMirrorBuilder().withName('fieldName').withType('Integer').build())
        .build();

      TypesRepository.getInstance = jest.fn().mockReturnValue({
        getFromAllByName: jest.fn().mockReturnValue(classMirror),
      });

      const result = new ReferenceBuilder().build('className');

      expect(result.schema.properties).toHaveProperty('fieldName');
      expect(result.schema.properties!['fieldName'].type).toBe('integer');
    });

    it('should correctly identify and parse Long fields', function () {
      const classMirror = new ClassMirrorBuilder()
        .addFiled(new FieldMirrorBuilder().withName('fieldName').withType('Long').build())
        .build();

      TypesRepository.getInstance = jest.fn().mockReturnValue({
        getFromAllByName: jest.fn().mockReturnValue(classMirror),
      });

      const result = new ReferenceBuilder().build('className');

      expect(result.schema.properties).toHaveProperty('fieldName');
      expect(result.schema.properties!['fieldName'].type).toBe('integer');
      expect(result.schema.properties!['fieldName'].format).toBe('int64');
    });

    it('should correctly identify and parse String fields', function () {
      const classMirror = new ClassMirrorBuilder()
        .addFiled(new FieldMirrorBuilder().withName('fieldName').withType('String').build())
        .build();

      TypesRepository.getInstance = jest.fn().mockReturnValue({
        getFromAllByName: jest.fn().mockReturnValue(classMirror),
      });

      const result = new ReferenceBuilder().build('className');

      expect(result.schema.properties).toHaveProperty('fieldName');
      expect(result.schema.properties!['fieldName'].type).toBe('string');
    });

    it('should correctly identify and parse Time fields', function () {
      const classMirror = new ClassMirrorBuilder()
        .addFiled(new FieldMirrorBuilder().withName('fieldName').withType('Time').build())
        .build();

      TypesRepository.getInstance = jest.fn().mockReturnValue({
        getFromAllByName: jest.fn().mockReturnValue(classMirror),
      });

      const result = new ReferenceBuilder().build('className');

      expect(result.schema.properties).toHaveProperty('fieldName');
      expect(result.schema.properties!['fieldName'].type).toBe('string');
      expect(result.schema.properties!['fieldName'].format).toBe('time');
    });
  });
});
