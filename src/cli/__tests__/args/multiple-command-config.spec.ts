import { extractArgs } from '../../args';
import * as E from 'fp-ts/Either';
import { assertEither } from '../../../core/test-helpers/assert-either';
import {
  UserDefinedChangelogConfig,
  UserDefinedMarkdownConfig,
  UserDefinedOpenApiConfig,
} from '../../../core/shared/types';

describe('when extracting arguments', () => {
  describe('and a configuration is provided for multiple commands', () => {
    it('errors when a command was still passed through the cli', async () => {
      function getFromProcess() {
        return ['markdown'];
      }

      function extractConfig() {
        return Promise.resolve({
          config: {
            markdown: {
              sourceDir: 'force-app',
            },
          },
        });
      }

      const result = await extractArgs(getFromProcess, extractConfig);

      expect(E.isLeft(result)).toBeTruthy();
    });

    it('extracts multiple configurations', async () => {
      function getFromProcess() {
        return [];
      }

      function extractConfig() {
        return Promise.resolve({
          config: {
            markdown: {
              sourceDir: 'force-app',
            },
            openapi: {
              sourceDir: 'force-app',
            },
            changelog: {
              previousVersionDir: 'previous',
              currentVersionDir: 'force-app',
            },
          },
        });
      }

      const result = await extractArgs(getFromProcess, extractConfig);

      assertEither(result, (configs) => {
        expect(configs).toHaveLength(3);
        expect(configs[0].targetGenerator).toEqual('markdown');
        expect(configs[1].targetGenerator).toEqual('openapi');
        expect(configs[2].targetGenerator).toEqual('changelog');

        const markdownConfig = configs[0] as UserDefinedMarkdownConfig;
        expect(markdownConfig.sourceDir).toEqual('force-app');

        const openApiConfig = configs[1] as UserDefinedOpenApiConfig;
        expect(openApiConfig.sourceDir).toEqual('force-app');

        const changelogConfig = configs[2] as UserDefinedChangelogConfig;
        expect(changelogConfig.previousVersionDir).toEqual('previous');
        expect(changelogConfig.currentVersionDir).toEqual('force-app');
      });
    });

    it('fails when a non-supported command is provided', async () => {
      function getFromProcess() {
        return [];
      }

      function extractConfig() {
        return Promise.resolve({
          config: {
            markdown: {
              sourceDir: 'force-app',
            },
            openapi: {
              sourceDir: 'force-app',
            },
            changelog: {
              previousVersionDir: 'previous',
              currentVersionDir: 'force-app',
            },
            invalidCommand: {
              foo: 'bar',
            },
          },
        });
      }

      const result = await extractArgs(getFromProcess, extractConfig);

      expect(E.isLeft(result)).toBeTruthy();
    });
  });
});
