import MethodModel from '../MethodModel';

test('name line can be set', () => {
  const method = new MethodModel();
  const nameLine = 'public static void testMethod() {';
  method.setNameLine(nameLine, 1);

  // Expected everyhing after the parameter list to be removed
  const expected = 'public static void testMethod()';
  expect(method.getNameLine()).toBe(expected);
});

test('new method is empty', () => {
  const method = new MethodModel();

  expect(method.getParams()).toHaveLength(0);
  expect(method.getReturnType()).toBe('');
  expect(method.getMethodName()).toBe('');
});

test('params can be set', () => {
  const method = new MethodModel();
  const params = ['a', 'b', 'c'];

  method.setParams(params);

  expect(method.getParams()).toBe(params);
});

test('return type is method name when method is constructor', () => {
  const method = new MethodModel();
  const nameLine = 'public TestClass() {';
  method.setNameLine(nameLine, 10);
  method.setIsConstructor(true);

  expect(method.getReturnType()).toBe('TestClass');
});

test('return type returns previous word when method is not constructor', () => {
  const method = new MethodModel();
  const nameLine = 'public static void testMethod() {';
  method.setNameLine(nameLine, 10);
  method.setIsConstructor(false);

  expect(method.getReturnType()).toBe('void');
});

test('signature can be retrieved', () => {
  const method = new MethodModel();
  const nameLine = 'public static void testMethod() {';
  method.setNameLine(nameLine, 10);
  method.setIsConstructor(false);

  expect(method.getSignature()).toBe('testMethod()');
});

test('method name is retrieved correctly', () => {
  const method = new MethodModel();
  const nameLine = 'public static void testMethod() {';
  method.setNameLine(nameLine, 1);

  expect(method.getMethodName()).toBe('testMethod');
});

test('can get and set if the method is a constructor', () => {
  const method = new MethodModel();
  method.setIsConstructor(true);

  expect(method.getIsConstructor()).toBe(true);
});
