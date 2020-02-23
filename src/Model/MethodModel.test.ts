import MethodModel from './MethodModel';

test('name line can be set', () => {
  const method = new MethodModel();
  const nameLine = 'public static void testMethod() {';
  method.setNameLine(nameLine, 1);

  // Expected everyhing after the parameter list to be removed
  let expected = 'public static void testMethod()';
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

test('return type can be set', () => {
  const method = new MethodModel();
  const returnType = 'void';

  method.setReturnType(returnType);

  expect(method.getReturnType()).toBe(returnType);
});

test('method name is retrieved correctly', () => {
  const method = new MethodModel();
  const nameLine = 'public static void testMethod() {';
  method.setNameLine(nameLine, 1);

  expect(method.getMethodName()).toBe('testMethod');
});
