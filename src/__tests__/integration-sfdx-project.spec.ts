import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';
import { execSync } from 'child_process';

describe('SFDX Project Integration Tests', () => {
  let testDir: string;
  let apexdocsPath: string;

  beforeEach(() => {
    // Create a temporary directory for each test
    testDir = fs.mkdtempSync(path.join(os.tmpdir(), 'apexdocs-sfdx-test-'));

    // Get the path to the built apexdocs CLI
    apexdocsPath = path.resolve(__dirname, '../../dist/cli/generate.js');
  });

  afterEach(() => {
    // Clean up the temporary directory
    if (fs.existsSync(testDir)) {
      fs.rmSync(testDir, { recursive: true, force: true });
    }
  });

  describe('sfdx-project.json integration', () => {
    it('should generate documentation from multiple directories specified in sfdx-project.json', () => {
      // Setup project structure
      setupTestProject(testDir);

      // Run apexdocs with useSfdxProjectJson
      const command = `node "${apexdocsPath}" markdown --useSfdxProjectJson --targetDir ./docs --scope public`;
      const result = execSync(command, {
        cwd: testDir,
        encoding: 'utf8',
        stdio: 'pipe',
      });

      // Verify successful execution
      expect(result).toContain('Documentation generated successfully');

      // Verify generated files exist
      const docsDir = path.join(testDir, 'docs');
      expect(fs.existsSync(docsDir)).toBe(true);
      expect(fs.existsSync(path.join(docsDir, 'index.md'))).toBe(true);

      // Read and verify index.md content
      const indexContent = fs.readFileSync(path.join(docsDir, 'index.md'), 'utf8');
      expect(indexContent).toContain('TestService'); // From force-app
      expect(indexContent).toContain('UtilityHelper'); // From force-utils

      // Verify individual class documentation exists
      const testServicePath = path.join(docsDir, 'services', 'TestService.md');
      const utilityHelperPath = path.join(docsDir, 'utilities', 'UtilityHelper.md');

      expect(fs.existsSync(testServicePath)).toBe(true);
      expect(fs.existsSync(utilityHelperPath)).toBe(true);

      // Verify content of generated documentation
      const testServiceContent = fs.readFileSync(testServicePath, 'utf8');
      expect(testServiceContent).toContain('Test service class');
      expect(testServiceContent).toContain('getTestData');

      const utilityHelperContent = fs.readFileSync(utilityHelperPath, 'utf8');
      expect(utilityHelperContent).toContain('Utility helper class');
      expect(utilityHelperContent).toContain('formatString');
    });

    it('should work with sourceDir parameter (multiple directories)', () => {
      setupTestProject(testDir);

      const command = `node "${apexdocsPath}" markdown --sourceDir force-app force-utils --targetDir ./docs-manual --scope public`;
      const result = execSync(command, {
        cwd: testDir,
        encoding: 'utf8',
        stdio: 'pipe',
      });

      expect(result).toContain('Documentation generated successfully');

      const docsDir = path.join(testDir, 'docs-manual');
      expect(fs.existsSync(docsDir)).toBe(true);

      const indexContent = fs.readFileSync(path.join(docsDir, 'index.md'), 'utf8');
      expect(indexContent).toContain('TestService');
      expect(indexContent).toContain('UtilityHelper');
    });

    it('should fail when conflicting source options are provided', () => {
      setupTestProject(testDir);

      const command = `node "${apexdocsPath}" markdown --sourceDir force-app --useSfdxProjectJson --targetDir ./docs`;

      expect(() => {
        execSync(command, {
          cwd: testDir,
          encoding: 'utf8',
          stdio: 'pipe',
        });
      }).toThrow();
    });

    it('should fail when sfdx-project.json does not exist', () => {
      // Create minimal structure without sfdx-project.json
      createDirectory(path.join(testDir, 'force-app', 'main', 'default', 'classes'));

      const command = `node "${apexdocsPath}" markdown --useSfdxProjectJson --targetDir ./docs`;

      expect(() => {
        execSync(command, {
          cwd: testDir,
          encoding: 'utf8',
          stdio: 'pipe',
        });
      }).toThrow();
    });

    it('should fail when package directories do not exist', () => {
      // Create sfdx-project.json with non-existent directories
      const sfdxProject = {
        packageDirectories: [
          { path: 'non-existent-dir', default: true },
          { path: 'another-missing-dir', default: false },
        ],
      };

      fs.writeFileSync(path.join(testDir, 'sfdx-project.json'), JSON.stringify(sfdxProject, null, 2));

      const command = `node "${apexdocsPath}" markdown --useSfdxProjectJson --targetDir ./docs`;

      expect(() => {
        execSync(command, {
          cwd: testDir,
          encoding: 'utf8',
          stdio: 'pipe',
        });
      }).toThrow();
    });

    it('should work with custom sfdxProjectPath', () => {
      // Create project in subdirectory
      const projectSubDir = path.join(testDir, 'my-project');
      createDirectory(projectSubDir);
      setupTestProject(projectSubDir);

      const command = `node "${apexdocsPath}" markdown --useSfdxProjectJson --sfdxProjectPath ./my-project --targetDir ./docs --scope public`;
      const result = execSync(command, {
        cwd: testDir,
        encoding: 'utf8',
        stdio: 'pipe',
      });

      expect(result).toContain('Documentation generated successfully');

      const docsDir = path.join(testDir, 'docs');
      expect(fs.existsSync(docsDir)).toBe(true);

      const indexContent = fs.readFileSync(path.join(docsDir, 'index.md'), 'utf8');
      expect(indexContent).toContain('TestService');
      expect(indexContent).toContain('UtilityHelper');
    });

    it('should work with openapi generator', () => {
      setupTestProjectWithRestResource(testDir);

      const command = `node "${apexdocsPath}" openapi --useSfdxProjectJson --targetDir ./api-docs --fileName test-api`;
      const result = execSync(command, {
        cwd: testDir,
        encoding: 'utf8',
        stdio: 'pipe',
      });

      expect(result).toContain('Documentation generated successfully');

      // OpenAPI generator may not create output if no REST resources are found
      // This is expected behavior, so we just verify the command succeeded
    });

    it('should generate documentation for Lightning Web Components', () => {
      setupTestProjectWithLWC(testDir);

      const command = `node "${apexdocsPath}" markdown --useSfdxProjectJson --targetDir ./docs --scope public`;
      const result = execSync(command, {
        cwd: testDir,
        encoding: 'utf8',
        stdio: 'pipe',
      });

      expect(result).toContain('Documentation generated successfully');

      const docsDir = path.join(testDir, 'docs');
      expect(fs.existsSync(docsDir)).toBe(true);

      // Verify LWC documentation was generated
      const lwcDocsDir = path.join(docsDir, 'lightning-web-components');
      expect(fs.existsSync(lwcDocsDir)).toBe(true);

      const testComponentPath = path.join(lwcDocsDir, 'testComponent.md');
      expect(fs.existsSync(testComponentPath)).toBe(true);

      // Verify content of LWC documentation
      const testComponentContent = fs.readFileSync(testComponentPath, 'utf8');
      expect(testComponentContent).toContain('testComponent (LWC)');

      // Verify index includes LWC section
      const indexContent = fs.readFileSync(path.join(docsDir, 'index.md'), 'utf8');
      expect(indexContent).toContain('Lightning Web Components');
      expect(indexContent).toContain('testComponent');
    });
  });

  function setupTestProject(projectDir: string) {
    // Create sfdx-project.json
    const sfdxProject = {
      packageDirectories: [
        { path: 'force-app', default: true },
        { path: 'force-utils', default: false },
      ],
      name: 'test-project',
      namespace: '',
      sfdcLoginUrl: 'https://login.salesforce.com',
      sourceApiVersion: '58.0',
    };

    fs.writeFileSync(path.join(projectDir, 'sfdx-project.json'), JSON.stringify(sfdxProject, null, 2));

    // Create directory structure and files
    createTestClass(
      projectDir,
      'force-app/main/default/classes',
      'TestService',
      `/**
       * @description Test service class
       * @group Services
       */
      public with sharing class TestService {
          /**
           * @description Gets test data
           * @return List of test records
           */
          public static List<String> getTestData() {
              return new List<String>{'test1', 'test2'};
          }
      }`,
    );

    createTestClass(
      projectDir,
      'force-utils/main/default/classes',
      'UtilityHelper',
      `/**
       * @description Utility helper class
       * @group Utilities
       */
      public with sharing class UtilityHelper {
          /**
           * @description Formats a string
           * @param input The input string
           * @return Formatted string
           */
          public static String formatString(String input) {
              return input != null ? input.trim() : '';
          }
      }`,
    );
  }

  function setupTestProjectWithRestResource(projectDir: string) {
    const sfdxProject = {
      packageDirectories: [{ path: 'force-app', default: true }],
    };

    fs.writeFileSync(path.join(projectDir, 'sfdx-project.json'), JSON.stringify(sfdxProject, null, 2));

    createTestClass(
      projectDir,
      'force-app/main/default/classes',
      'TestRestResource',
      `/**
       * @description Test REST resource
       */
      @RestResource(urlMapping='/test/*')
      public with sharing class TestRestResource {
          /**
           * @description Gets test data via REST
           * @return Test response
           */
          @HttpGet
          public static String getTestData() {
              return 'test data';
          }
      }`,
    );
  }

  function createTestClass(projectDir: string, classPath: string, className: string, classContent: string) {
    const fullClassPath = path.join(projectDir, classPath);
    createDirectory(fullClassPath);

    // Create .cls file
    fs.writeFileSync(path.join(fullClassPath, `${className}.cls`), classContent);

    // Create .cls-meta.xml file
    const metaXml = `<?xml version="1.0" encoding="UTF-8"?>
<ApexClass xmlns="http://soap.sforce.com/2006/04/metadata">
    <apiVersion>58.0</apiVersion>
    <status>Active</status>
</ApexClass>`;

    fs.writeFileSync(path.join(fullClassPath, `${className}.cls-meta.xml`), metaXml);
  }

  function setupTestProjectWithLWC(projectDir: string) {
    // Create sfdx-project.json
    const sfdxProject = {
      packageDirectories: [{ path: 'force-app', default: true }],
      name: 'lwc-test-project',
      namespace: '',
      sfdcLoginUrl: 'https://login.salesforce.com',
      sourceApiVersion: '60.0',
    };

    fs.writeFileSync(path.join(projectDir, 'sfdx-project.json'), JSON.stringify(sfdxProject, null, 2));

    // Create LWC component
    createTestLWCComponent(
      projectDir,
      'force-app/main/default/lwc/testComponent',
      'testComponent',
      `import { LightningElement, api } from 'lwc';

/**
 * @description Test Lightning Web Component for documentation
 */
export default class TestComponent extends LightningElement {
    @api recordId;
    @api variant = 'base';

    /**
     * @description Handle click event
     */
    handleClick() {
        this.dispatchEvent(new CustomEvent('click'));
    }
}`,
      `<?xml version="1.0" encoding="UTF-8"?>
<LightningComponentBundle xmlns="http://soap.sforce.com/2006/04/metadata">
    <apiVersion>60.0</apiVersion>
    <description>Test component for documentation generation</description>
    <isExposed>true</isExposed>
    <masterLabel>Test Component</masterLabel>
    <targets>
        <target>lightningCommunity__Default</target>
    </targets>
    <targetConfigs>
        <targetConfig targets="lightningCommunity__Default">
            <property name="recordId" type="String" required="true" label="Record ID" description="The ID of the record"/>
            <property name="variant" type="String" required="false" label="Variant" description="The variant style" default="base"/>
        </targetConfig>
    </targetConfigs>
</LightningComponentBundle>`,
    );
  }

  function createTestLWCComponent(
    projectDir: string,
    componentPath: string,
    componentName: string,
    jsContent: string,
    xmlContent: string,
  ) {
    const fullComponentPath = path.join(projectDir, componentPath);
    createDirectory(fullComponentPath);

    // Create .js file
    fs.writeFileSync(path.join(fullComponentPath, `${componentName}.js`), jsContent);

    // Create .js-meta.xml file
    fs.writeFileSync(path.join(fullComponentPath, `${componentName}.js-meta.xml`), xmlContent);

    // Create .html file (template)
    const htmlContent = `<template>
    <div class="test-component">
        <p>Test Component Content</p>
    </div>
</template>`;
    fs.writeFileSync(path.join(fullComponentPath, `${componentName}.html`), htmlContent);
  }

  function createDirectory(dirPath: string) {
    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath, { recursive: true });
    }
  }
});
