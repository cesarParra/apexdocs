import { extractArgs } from '../../args';
import * as E from 'fp-ts/Either';
import { assertEither } from '../../../core/test-helpers/assert-either';
import {
  UserDefinedChangelogConfig,
  UserDefinedMarkdownConfig,
  UserDefinedOpenApiConfig,
} from '../../../core/shared/types';

function exitFake(): never {
  throw new Error('process.exit() was called');
}

describe('when extracting arguments', () => {
  beforeEach(() => {
    // Remove all cached modules. The cache needs to be cleared before running
    // each command, otherwise you will see the same results from the command
    // run in your first test in subsequent tests.
    jest.resetModules();
  });

  afterEach(() => {
    jest.resetAllMocks();
    jest.clearAllMocks();
  });

  describe('and a configuration is provided for a single command', () => {
    it('extracts the arguments from the process for the markdown command from the configuration', async () => {
      function getFromProcess() {
        return ['markdown'];
      }

      function extractConfig() {
        return Promise.resolve({
          config: {
            sourceDir: 'force-app',
          },
        });
      }

      const result = await extractArgs(getFromProcess, extractConfig);

      assertEither(result, (configs) => {
        expect(configs).toHaveLength(1);
        expect(configs[0].targetGenerator).toEqual('markdown');

        const markdownConfig = configs[0] as UserDefinedMarkdownConfig;
        expect(markdownConfig.sourceDir).toEqual(['force-app']);
      });
    });

    it('extracts the arguments from the process for the openapi command from the configuration', async () => {
      function getFromProcess() {
        return ['openapi'];
      }

      function extractConfig() {
        return Promise.resolve({
          config: {
            sourceDir: 'force-app',
          },
        });
      }

      const result = await extractArgs(getFromProcess, extractConfig);

      assertEither(result, (configs) => {
        expect(configs).toHaveLength(1);
        expect(configs[0].targetGenerator).toEqual('openapi');

        const openApiConfig = configs[0] as UserDefinedOpenApiConfig;
        expect(openApiConfig.sourceDir).toEqual(['force-app']);
      });
    });

    it('extracts the arguments from the process for the changelog command from the configuration', async () => {
      function getFromProcess() {
        return ['changelog'];
      }

      function extractConfig() {
        return Promise.resolve({
          config: {
            previousVersionDir: 'previous',
            currentVersionDir: 'force-app',
          },
        });
      }

      const result = await extractArgs(getFromProcess, extractConfig);

      assertEither(result, (configs) => {
        expect(configs).toHaveLength(1);
        expect(configs[0].targetGenerator).toEqual('changelog');

        const changelogConfig = configs[0] as UserDefinedChangelogConfig;

        expect(changelogConfig.previousVersionDir).toEqual(['previous']);
        expect(changelogConfig.currentVersionDir).toEqual(['force-app']);
      });
    });

    it('fails when a not-supported command is provided', async () => {
      function getFromProcess() {
        return ['not-supported'];
      }

      function extractConfig() {
        return Promise.resolve({
          config: {
            previousVersionDir: 'previous',
            currentVersionDir: 'force-app',
          },
        });
      }

      const result = await extractArgs(getFromProcess, extractConfig);

      expect(E.isLeft(result)).toBeTruthy();
    });

    it('errors when no command is provided', async () => {
      jest.spyOn(console, 'error').mockImplementation(() => {});
      jest.spyOn(process, 'exit').mockImplementation(exitFake);
      function getFromProcess() {
        return [];
      }

      function extractConfig() {
        return Promise.resolve({
          config: {},
        });
      }

      try {
        await extractArgs(getFromProcess, extractConfig);
        expect(false).toBeTruthy();
      } catch (error) {
        expect(error).toBeDefined();
      }
    });

    it('errors when a required argument is not provided', async () => {
      jest.spyOn(console, 'error').mockImplementation(() => {});
      jest.spyOn(process, 'exit').mockImplementation(exitFake);

      function getFromProcess() {
        return ['markdown'];
      }

      function extractConfig() {
        return Promise.resolve({
          config: {},
        });
      }

      try {
        await extractArgs(getFromProcess, extractConfig);
        expect(false).toBeTruthy();
      } catch (error) {
        expect(error).toBeDefined();
      }
    });
  });
});
