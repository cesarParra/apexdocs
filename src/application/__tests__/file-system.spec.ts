import * as fs from 'fs';
import * as os from 'os';
import * as nodePath from 'path';
import { DefaultFileSystem } from '../file-system';
import { SourceComponentAdapter } from '../source-code-file-reader';

let tmp: string;

function write(relPath: string, contents = '') {
  const full = nodePath.join(tmp, relPath);
  fs.mkdirSync(nodePath.dirname(full), { recursive: true });
  fs.writeFileSync(full, contents);
  return full;
}

function byType(components: SourceComponentAdapter[], name: string) {
  return components.filter((c) => c.type.name === name);
}

beforeEach(() => {
  tmp = fs.mkdtempSync(nodePath.join(os.tmpdir(), 'apexdocs-fs-'));
});

afterEach(() => {
  fs.rmSync(tmp, { recursive: true, force: true });
});

describe('DefaultFileSystem.getComponents', () => {
  it('classifies the supported source-format metadata types', () => {
    write('force-app/classes/Foo.cls', 'public class Foo {}');
    write('force-app/classes/Foo.cls-meta.xml', '<ApexClass/>');
    write('force-app/triggers/Bar.trigger', 'trigger Bar on Account {}');
    write('force-app/lwc/myCmp/myCmp.js', '');
    write('force-app/lwc/myCmp/myCmp.js-meta.xml', '<LightningComponentBundle/>');
    write('force-app/objects/Account/Account.object-meta.xml', '<CustomObject/>');
    write('force-app/objects/Account/fields/MyField__c.field-meta.xml', '<CustomField/>');
    write('force-app/customMetadata/MyType.MyRecord.md-meta.xml', '<CustomMetadata/>');

    const components = new DefaultFileSystem().getComponents(nodePath.join(tmp, 'force-app'));

    const apex = byType(components, 'ApexClass');
    expect(apex).toHaveLength(1);
    expect(apex[0].name).toBe('Foo');
    expect(apex[0].content).toBe(nodePath.join(tmp, 'force-app/classes/Foo.cls'));
    expect(apex[0].xml).toBe(nodePath.join(tmp, 'force-app/classes/Foo.cls-meta.xml'));

    expect(byType(components, 'ApexTrigger')[0].name).toBe('Bar');

    const lwc = byType(components, 'LightningComponentBundle');
    expect(lwc[0].name).toBe('myCmp');

    expect(byType(components, 'CustomObject')[0].name).toBe('Account');

    const field = byType(components, 'CustomField')[0];
    expect(field.name).toBe('MyField__c');
    expect(field.parent?.name).toBe('Account');

    expect(byType(components, 'CustomMetadata')[0].name).toBe('MyType.MyRecord');
  });

  it('leaves xml undefined for an apex class with no meta file', () => {
    write('force-app/classes/NoMeta.cls', 'public class NoMeta {}');
    const components = new DefaultFileSystem().getComponents(nodePath.join(tmp, 'force-app'));
    expect(byType(components, 'ApexClass')[0].xml).toBeUndefined();
  });

  it('ignores dotfiles and .dup files by default', () => {
    write('force-app/classes/Real.cls', 'public class Real {}');
    write('force-app/.eslintrc.json', '{}');
    write('force-app/classes/Real.cls.dup', 'dup');
    write('force-app/.DS_Store', '');

    const components = new DefaultFileSystem().getComponents(nodePath.join(tmp, 'force-app'));
    expect(byType(components, 'ApexClass')).toHaveLength(1);
  });

  it('honors .forceignore patterns, including negation', () => {
    write('.forceignore', ['**/__tests__/**', '**/*.cls', '!**/Kept.cls'].join('\n'));
    write('force-app/classes/Kept.cls', 'public class Kept {}');
    write('force-app/classes/Ignored.cls', 'public class Ignored {}');
    write('force-app/lwc/c/__tests__/c.test.js', '');
    write('force-app/lwc/c/c.js', '');
    write('force-app/lwc/c/c.js-meta.xml', '<LightningComponentBundle/>');

    const components = new DefaultFileSystem().getComponents(nodePath.join(tmp, 'force-app'));
    const apexNames = byType(components, 'ApexClass').map((c) => c.name);
    expect(apexNames).toContain('Kept');
    expect(apexNames).not.toContain('Ignored');
    // The bundle survives; its __tests__ directory is pruned.
    expect(byType(components, 'LightningComponentBundle')).toHaveLength(1);
  });
});
