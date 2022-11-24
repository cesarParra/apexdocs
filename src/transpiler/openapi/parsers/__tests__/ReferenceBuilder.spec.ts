import { TypesRepository } from '../../../../model/types-repository';
import { ReferenceBuilder } from '../ReferenceBuilder';

it('should throw an error if the reference does not exist', function () {
  TypesRepository.getInstance = jest.fn().mockReturnValue({
    getFromAllByName: jest.fn().mockReturnValue(null),
  });

  expect(() => {
    new ReferenceBuilder().build('AnyName');
  }).toThrow(Error);

  // TODO: Rest of the unit tests
});
