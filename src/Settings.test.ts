import Settings from './Settings';

test('has global and public as default scope', () => {
  expect(Settings.getInstance().getScope()).toHaveLength(2);
  expect(Settings.getInstance().getScope()).toContain('global');
  expect(Settings.getInstance().getScope()).toContain('public');
});

test('can set scope', () => {
  const expectedScope = ['private'];

  Settings.getInstance().setScope(expectedScope);

  expect(Settings.getInstance().getScope()).toHaveLength(1);
  expect(Settings.getInstance().getScope()).toContain('private');
});

test('has "docs" as the default output directory', () => {
  expect(Settings.getInstance().getOutputDir()).toBe('docs');
});

test('can set output directory', () => {
  const directory = 'cutomdir';

  Settings.getInstance().setOutputDir(directory);

  expect(Settings.getInstance().getOutputDir()).toBe(directory);
});
