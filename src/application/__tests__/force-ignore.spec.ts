import * as fs from 'fs';
import * as os from 'os';
import * as nodePath from 'path';
import { ForceIgnore } from '../force-ignore';

let root: string;

/** Absolute path under the temp root, using OS separators. */
function p(relPath: string): string {
  return nodePath.join(root, ...relPath.split('/'));
}

/** Build a ForceIgnore rooted at the temp dir from the given .forceignore lines. */
function ignoreWith(...lines: string[]): ForceIgnore {
  const file = nodePath.join(root, '.forceignore');
  fs.writeFileSync(file, lines.join('\n'));
  return new ForceIgnore(file);
}

beforeEach(() => {
  root = fs.mkdtempSync(nodePath.join(os.tmpdir(), 'apexdocs-fi-'));
});

afterEach(() => {
  fs.rmSync(root, { recursive: true, force: true });
});

describe('ForceIgnore defaults', () => {
  it('ignores dotfiles and .dup files with no .forceignore present', () => {
    const fi = new ForceIgnore(undefined, root);
    expect(fi.denies(p('force-app/.eslintrc.json'))).toBe(true);
    expect(fi.denies(p('.DS_Store'))).toBe(true);
    expect(fi.denies(p('force-app/classes/Foo.cls.dup'))).toBe(true);
    expect(fi.denies(p('force-app/classes/Foo.cls'))).toBe(false);
  });

  it('applies defaults even alongside a real .forceignore file', () => {
    const fi = ignoreWith('package.xml');
    expect(fi.denies(p('.hidden'))).toBe(true);
    expect(fi.denies(p('package.xml'))).toBe(true);
    expect(fi.denies(p('force-app/classes/Foo.cls'))).toBe(false);
  });
});

describe('ForceIgnore pattern semantics', () => {
  it('skips comments and blank lines', () => {
    const fi = ignoreWith('# a comment', '', '   ', 'Foo.cls');
    expect(fi.denies(p('Foo.cls'))).toBe(true);
    // A file literally sharing a comment-like name is not a rule.
    expect(fi.denies(p('# a comment'))).toBe(false);
  });

  it('matches a floating (no-slash) pattern at any depth', () => {
    const fi = ignoreWith('package.xml');
    expect(fi.denies(p('package.xml'))).toBe(true);
    expect(fi.denies(p('force-app/main/package.xml'))).toBe(true);
  });

  it('anchors a leading-slash pattern to the root only', () => {
    const fi = ignoreWith('/package.xml');
    expect(fi.denies(p('package.xml'))).toBe(true);
    expect(fi.denies(p('force-app/package.xml'))).toBe(false);
  });

  it('anchors a pattern with an embedded slash to the root', () => {
    const fi = ignoreWith('force-app/generated');
    expect(fi.denies(p('force-app/generated/Foo.cls'))).toBe(true);
    expect(fi.denies(p('other/force-app/generated/Foo.cls'))).toBe(false);
  });

  it('treats **/ as zero or more directories', () => {
    const fi = ignoreWith('**/jsconfig.json');
    expect(fi.denies(p('jsconfig.json'))).toBe(true);
    expect(fi.denies(p('force-app/lwc/foo/jsconfig.json'))).toBe(true);
  });

  it('does not let * cross directory separators', () => {
    const fi = ignoreWith('force-app/*.cls');
    expect(fi.denies(p('force-app/Foo.cls'))).toBe(true);
    expect(fi.denies(p('force-app/classes/Foo.cls'))).toBe(false);
  });

  it('matches a single character with ?', () => {
    const fi = ignoreWith('Foo?.cls');
    expect(fi.denies(p('FooA.cls'))).toBe(true);
    expect(fi.denies(p('Foo.cls'))).toBe(false);
    expect(fi.denies(p('FooAB.cls'))).toBe(false);
  });

  it('matches a directory pattern and everything under it', () => {
    const fi = ignoreWith('**/__tests__/');
    expect(fi.denies(p('force-app/lwc/foo/__tests__/foo.test.js'))).toBe(true);
    expect(fi.denies(p('force-app/lwc/foo/foo.js'))).toBe(false);
  });

  it('escapes regex metacharacters in literal segments', () => {
    const fi = ignoreWith('a+b.cls');
    expect(fi.denies(p('a+b.cls'))).toBe(true);
    // The '.' must be literal, not a regex wildcard.
    expect(fi.denies(p('aXbXcls'))).toBe(false);
  });
});

describe('ForceIgnore negation (last match wins)', () => {
  it('re-includes a previously ignored file', () => {
    const fi = ignoreWith('**/*.cls', '!**/Keep.cls');
    expect(fi.denies(p('force-app/Drop.cls'))).toBe(true);
    expect(fi.denies(p('force-app/Keep.cls'))).toBe(false);
  });

  it('respects rule order — a later ignore wins over an earlier negation', () => {
    const fi = ignoreWith('!**/Keep.cls', '**/*.cls');
    expect(fi.denies(p('force-app/Keep.cls'))).toBe(true);
  });
});

describe('ForceIgnore.findAndCreate', () => {
  it('finds a .forceignore in an ancestor of the walk seed', () => {
    fs.writeFileSync(nodePath.join(root, '.forceignore'), 'Secret.cls');
    fs.mkdirSync(p('force-app/classes'), { recursive: true });
    const fi = ForceIgnore.findAndCreate(p('force-app'));
    // Pattern is matched relative to the .forceignore's directory (the root), not the seed.
    expect(fi.denies(p('force-app/classes/Secret.cls'))).toBe(true);
    expect(fi.denies(p('force-app/classes/Public.cls'))).toBe(false);
  });

  it('falls back to defaults when no .forceignore exists up the tree', () => {
    fs.mkdirSync(p('force-app'), { recursive: true });
    const fi = ForceIgnore.findAndCreate(p('force-app'));
    expect(fi.denies(p('force-app/.DS_Store'))).toBe(true);
    expect(fi.denies(p('force-app/classes/Foo.cls'))).toBe(false);
  });
});
