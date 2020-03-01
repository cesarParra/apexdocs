import ClassModel from '../ClassModel';
import PropertyModel from '../PropertyModel';
import MethodModel from '../MethodModel';

test('new class model initializes correctly', () => {
  const classModel = new ClassModel();

  expect(classModel.getProperties()).toHaveLength(0);
  expect(classModel.getMethods()).toHaveLength(0);
  expect(classModel.getChildClasses()).toHaveLength(0);
  expect(classModel.getClassName()).toBe('');
  expect(classModel.getTopmostClassName()).toBe('');
  expect(classModel.getClassGroup()).toBe('');
  expect(classModel.getClassGroupContent()).toBe('');
  expect(classModel.getIsInterface()).toBe(false);
});

test('can set properties', () => {
  const classModel = new ClassModel();
  const properties = [new PropertyModel()];

  classModel.setProperties(properties);
  expect(classModel.getProperties()).toBe(properties);
});

test('can set methods', () => {
  const classModel = new ClassModel();
  const methods = [new MethodModel()];

  classModel.setMethods(methods);
  expect(classModel.getMethods()).toBe(methods);
});

test('can add children', () => {
  const classModel = new ClassModel();
  const childClass = new ClassModel();

  classModel.addChildClass(childClass);
  expect(classModel.getChildClasses().length).toBe(1);
  expect(classModel.getChildClasses()[0]).toBe(childClass);
});

test('class name can be set and retrieved correctly', () => {
  const classModel = new ClassModel();
  const nameLine = 'public with sharing class TestClassName {';
  classModel.setNameLine(nameLine, 1);

  expect(classModel.getClassName()).toBe('TestClassName');
});

test('interface name can be retrieved correctly', () => {
  const classModel = new ClassModel();
  const nameLine = 'public interface TestInterfaceName {';
  classModel.setNameLine(nameLine, 1);

  expect(classModel.getClassName()).toBe('TestInterfaceName');
});

test('topmost class name is the class name when it has no parent', () => {
  const classModel = new ClassModel();
  const nameLine = 'public abstract class TestClassName {';
  classModel.setNameLine(nameLine, 1);

  expect(classModel.getClassName()).toBe('TestClassName');
});

test('topmost class name is parent name', () => {
  const parentClass = new ClassModel();
  const nameLine = 'public abstract class TestClassName {';
  parentClass.setNameLine(nameLine, 1);

  const childClass = new ClassModel(parentClass);
  const nameLineChild = 'private class ChildClassName {';
  childClass.setNameLine(nameLineChild, 10);

  expect(childClass.getTopmostClassName()).toBe('TestClassName');
});

test('can add group', () => {
  const classModel = new ClassModel();
  const groupName = 'GroupName';
  classModel.setClassGroup(groupName);

  expect(classModel.getClassGroup()).toBe(groupName);
});

test('can add group content', () => {
  const classModel = new ClassModel();
  const groupContentName = 'GroupContentName';
  classModel.setClassGroupContent(groupContentName);

  expect(classModel.getClassGroupContent()).toBe(groupContentName);
});

test('can set as interface', () => {
  const classModel = new ClassModel();
  classModel.setIsInterface(true);

  expect(classModel.getIsInterface()).toBe(true);
});
