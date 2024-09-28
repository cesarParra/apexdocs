import { extractArgs } from '../args';
import * as E from 'fp-ts/Either';
import { assertEither } from '../../core/test-helpers/assert-either';
import {
  UserDefinedChangelogConfig,
  UserDefinedMarkdownConfig,
  UserDefinedOpenApiConfig,
} from '../../core/shared/types';

function exitFake(_code?: string | number | null | undefined): never {
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
  });

  describe('and no configuration is provided', () => {
    it('extracts the arguments from the process for the markdown command', async () => {
      function getFromProcess() {
        return ['markdown', '--sourceDir', 'force-app'];
      }

      const result = await extractArgs(getFromProcess);

      assertEither(result, (configs) => {
        expect(configs).toHaveLength(1);
        expect(configs[0].targetGenerator).toEqual('markdown');

        const markdownConfig = configs[0] as UserDefinedMarkdownConfig;
        expect(markdownConfig.sourceDir).toEqual('force-app');
      });
    });

    it('extracts the arguments from the process for the openapi command', async () => {
      function getFromProcess() {
        return ['openapi', '--sourceDir', 'force-app'];
      }

      const result = await extractArgs(getFromProcess);

      assertEither(result, (configs) => {
        expect(configs).toHaveLength(1);
        expect(configs[0].targetGenerator).toEqual('openapi');

        const openApiConfig = configs[0] as UserDefinedOpenApiConfig;
        expect(openApiConfig.sourceDir).toEqual('force-app');
      });
    });

    it('extracts the arguments from the process for the changelog command', async () => {
      function getFromProcess() {
        return ['changelog', '--previousVersionDir', 'previous', '--currentVersionDir', 'force-app'];
      }

      const result = await extractArgs(getFromProcess);

      assertEither(result, (configs) => {
        expect(configs).toHaveLength(1);
        expect(configs[0].targetGenerator).toEqual('changelog');

        const changelogConfig = configs[0] as UserDefinedChangelogConfig;

        expect(changelogConfig.previousVersionDir).toEqual('previous');
        expect(changelogConfig.currentVersionDir).toEqual('force-app');
      });
    });

    it('fails when a not-supported command is provided', async () => {
      function getFromProcess() {
        return ['not-supported'];
      }

      const result = await extractArgs(getFromProcess);

      expect(E.isLeft(result)).toBeTruthy();
    });

    it('prints an error to the console when no command is provided', async () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
      const mockExit = jest.spyOn(process, 'exit').mockImplementation(exitFake);
      function getFromProcess() {
        return [];
      }

      try {
        await extractArgs(getFromProcess);
      } catch (error) {
        // Do nothing
      }

      expect(consoleSpy).toHaveBeenCalled();

      consoleSpy.mockRestore();
      mockExit.mockRestore();
    });

    it('prints an error to the console when a required argument is not provided', async () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
      const mockExit = jest.spyOn(process, 'exit').mockImplementation(exitFake);
      function getFromProcess() {
        return ['markdown'];
      }

      try {
        await extractArgs(getFromProcess);
      } catch (error) {
        // Do nothing
      }

      expect(consoleSpy).toHaveBeenCalled();

      consoleSpy.mockRestore();
      mockExit.mockRestore();
    });
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
        expect(markdownConfig.sourceDir).toEqual('force-app');
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
        expect(openApiConfig.sourceDir).toEqual('force-app');
      });
    });
  });
});
