import Settings from './Settings';
import DocsProcessor from './DocsProcessor';

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

test('that the processor can be set', () => {
  const docsProcessor = jest.genMockFromModule('./DocsProcessor') as DocsProcessor;

  Settings.getInstance().setDocsProcessor(docsProcessor);

  expect(Settings.getInstance().getDocsProcessor()).toBe(docsProcessor);
});

test('that the config path can be set', () => {
  const configPath = './config.json';

  Settings.getInstance().setConfigPath(configPath);

  expect(Settings.getInstance().getConfigPath()).toBe(configPath);
});

test('that shouldGroup can be set', () => {
  const shouldGroup = false;

  Settings.getInstance().setShouldGroup(shouldGroup);

  expect(Settings.getInstance().getShouldGroup()).toBe(shouldGroup);
});
