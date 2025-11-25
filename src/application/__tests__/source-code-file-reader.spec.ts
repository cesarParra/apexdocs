import { FileSystem } from '../file-system';
import { processFiles, SourceComponentAdapter } from '../source-code-file-reader';

class TestFileSystem implements FileSystem {
  constructor(private readonly sourceComponents: SourceComponentAdapter[]) {}

  getComponents(): SourceComponentAdapter[] {
    return this.sourceComponents;
  }

  readFile(path: string): string {
    switch (path) {
      case 'Speaker.cls':
        return 'public class Speaker{}';
      case 'AnotherSpeaker.cls':
        return 'public class AnotherSpeaker{}';
      case 'SomeObject__c.object-meta.xml':
        return `
    <?xml version="1.0" encoding="UTF-8"?>
    <CustomObject xmlns="http://soap.sforce.com/2006/04/metadata">
        <deploymentStatus>Deployed</deploymentStatus>
        <description>test object for testing</description>
        <label>MyFirstObject</label>
        <pluralLabel>MyFirstObjects</pluralLabel>
    </CustomObject>`;
      default:
        return '';
    }
  }
}

describe('File Reader', () => {
  it('returns an empty list when no source components are found', async () => {
    const fileSystem = new TestFileSystem([]);

    const result = processFiles(fileSystem, { experimentalLwcSupport: false })(['ApexClass'])('', []);

    expect(result.length).toBe(0);
  });

  it('returns an empty list when reading Apex files and there are none', async () => {
    const fileSystem = new TestFileSystem([
      {
        name: 'Speaker__c',
        type: {
          id: 'customobject',
          name: 'CustomObject',
        },
        xml: 'force-app/main/default/objects/Speaker__c/Speaker__c.object-meta.xml',
        content: 'force-app/main/default/objects/Speaker__c',
      },
    ]);

    const result = processFiles(fileSystem, { experimentalLwcSupport: false })(['ApexClass'])('', []);
    expect(result.length).toBe(0);
  });

  it('returns the file contents for all Apex files', async () => {
    const fileSystem = new TestFileSystem([
      {
        name: 'Speaker',
        type: {
          id: 'apexclass',
          name: 'ApexClass',
        },
        xml: 'Speaker.cls-meta.xml',
        content: 'Speaker.cls',
      },
      {
        name: 'AnotherSpeaker',
        type: {
          id: 'apexclass',
          name: 'ApexClass',
        },
        xml: 'AnotherSpeaker.cls-meta.xml',
        content: 'AnotherSpeaker.cls',
      },
    ]);

    const result = processFiles(fileSystem, { experimentalLwcSupport: false })(['ApexClass'])('', []);
    expect(result.length).toBe(2);
    expect(result[0].content).toBe('public class Speaker{}');
    expect(result[1].content).toBe('public class AnotherSpeaker{}');
  });

  it('returns the file contents of all Object files', async () => {
    const fileSystem = new TestFileSystem([
      {
        name: 'SomeObject__c',
        type: {
          id: 'customobject',
          name: 'CustomObject',
        },
        xml: 'SomeObject__c.object-meta.xml',
        content: '',
      },
    ]);

    const result = processFiles(fileSystem, { experimentalLwcSupport: false })(['CustomObject'])('', []);
    expect(result.length).toBe(1);
    expect(result[0].content).toContain('test object for testing');
  });

  it('skips files that match the excluded glob pattern', async () => {
    const fileSystem = new TestFileSystem([
      {
        name: 'Speaker',
        type: {
          id: 'apexclass',
          name: 'ApexClass',
        },
        xml: 'Speaker.cls-meta.xml',
        content: 'Speaker.cls',
      },
      {
        name: 'AnotherSpeaker',
        type: {
          id: 'apexclass',
          name: 'ApexClass',
        },
        xml: 'AnotherSpeaker.cls-meta.xml',
        content: 'AnotherSpeaker.cls',
      },
    ]);

    const result = processFiles(fileSystem, { experimentalLwcSupport: false })(['ApexClass'])('', ['**/Speaker.cls']);
    expect(result.length).toBe(1);
    expect(result[0].content).toBe('public class AnotherSpeaker{}');
  });
});
