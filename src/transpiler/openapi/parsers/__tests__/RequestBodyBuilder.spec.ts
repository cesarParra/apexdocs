import { RequestBodyBuilder } from '../RequestBodyBuilder';
import { Reference } from '../ReferenceBuilder';
import { ReferenceObject } from '../../../../model/openapi/open-api-types';
import { ApexDocHttpRequestBody } from '../../../../model/openapi/apex-doc-types';

jest.mock('../ReferenceBuilder', () => {
  return {
    ReferenceBuilder: jest.fn().mockImplementation(() => {
      return {
        // eslint-disable-next-line @typescript-eslint/no-empty-function
        build: (): Reference => {
          return {
            referencedClass: 'MySampleClass',
            referenceObject: {
              $ref: '/mySampleClass',
            },
            schema: {
              type: 'string',
            },
          };
        },
      };
    }),
  };
});

it('should build a RequestBody based on the received schema', function () {
  const apexRequestBody: ApexDocHttpRequestBody = {
    description: 'Sample Request Body Description',
    required: true,
    schema: {
      type: 'object',
      properties: {
        Prop1: {
          type: 'string',
          description: 'A Property',
        },
      },
    },
  };

  const response = new RequestBodyBuilder().build(apexRequestBody);

  expect(response.reference).toBeUndefined();
  expect(response.requestBody.description).toBe('Sample Request Body Description');
  expect(response.requestBody.required).toBe(true);
  expect(response.requestBody.content).toHaveProperty('application/json');
  expect(response.requestBody.content['application/json'].schema).toBe(apexRequestBody.schema);
});

it('should build a RequestBody with a reference when receiving a reference class name', function () {
  const apexRequestBody: ApexDocHttpRequestBody = {
    schema: 'MyClassName',
  };

  const response = new RequestBodyBuilder().build(apexRequestBody);

  expect(response.reference).not.toBeUndefined();
  expect((response.requestBody.content['application/json']?.schema as ReferenceObject).$ref).toBe('/mySampleClass');
});
