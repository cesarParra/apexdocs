import PropertyModel from '../PropertyModel';

test('has no name by defaullt', () => {
  const property = new PropertyModel();

  expect(property.getPropertyName()).toBe('');
});

test('can set name line for property', () => {
  const nameLine = 'public PropertyName { get; set; }';

  const property = new PropertyModel();
  property.setNameLine(nameLine, 1);

  expect(property.getPropertyName()).toBe('PropertyName');
});

test('can set name line for null variable', () => {
  const nameLine = 'public PropertyName;';

  const property = new PropertyModel();
  property.setNameLine(nameLine, 1);

  expect(property.getPropertyName()).toBe('PropertyName');
});

test('can set name line for initialized variable', () => {
  const nameLine = 'public PropertyName;';

  const property = new PropertyModel();
  property.setNameLine(nameLine, 1);

  expect(property.getPropertyName()).toBe('PropertyName');
});
