import { ParameterObjectBuilder } from '../ParameterObjectBuilder';
import { Reference } from '../ReferenceBuilder';
import { ReferenceObject } from '../../../../model/openapi/open-api-types';
import { ApexDocParameterObject } from '../../../../model/openapi/apex-doc-types';

jest.mock('../ReferenceBuilder', () => {
  return {
    ReferenceBuilder: jest.fn().mockImplementation(() => {
      return {
        build: (): Reference => {
          return {
            referenceComponents: [
              {
                referencedClass: 'MySampleClass',
                schema: {
                  type: 'string',
                },
              },
            ],
            entrypointReferenceObject: {
              $ref: '/mySampleClass',
            },
          };
        },
      };
    }),
  };
});

it('should build a ParameterObject based on the received schema', function () {
  const apexDocParameter: ApexDocParameterObject = {
    name: 'limit',
    in: 'query',
    description: 'Sample description',
    required: true,
    schema: {
      type: 'string',
    },
  };

  const response = new ParameterObjectBuilder().build(apexDocParameter);

  expect(response.reference).toBeUndefined();
  expect(response.body.name).toBe('limit');
  expect(response.body.in).toBe('query');
  expect(response.body.description).toBe('Sample description');
  expect(response.body.required).toBe(true);
  expect(response.body.schema).toBe(apexDocParameter.schema);
});

it('should build a ParameterObject with a reference when referencing a different class', function () {
  const apexDocParameter: ApexDocParameterObject = {
    name: 'limit',
    in: 'query',
    description: 'Sample description',
    required: true,
    schema: 'SomeClass',
  };

  const response = new ParameterObjectBuilder().build(apexDocParameter);

  expect(response.reference).not.toBeUndefined();
  expect(response.body.name).toBe('limit');
  expect(response.body.in).toBe('query');
  expect(response.body.description).toBe('Sample description');
  expect(response.body.required).toBe(true);
  expect((response.body.schema as ReferenceObject).$ref).toBe('/mySampleClass');
});
