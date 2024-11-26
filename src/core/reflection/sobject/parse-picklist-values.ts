import { CustomFieldMetadata } from './reflect-custom-field-source';

type MaybeTyped = {
  type?: string;
};

export function getPickListValues(customField: MaybeTyped): string[] | undefined {
  return hasType(customField) && isPicklist(customField) ? toPickListValues(customField) : undefined;
}

function hasType(customField: MaybeTyped): customField is { type: string } {
  return !!(customField as CustomFieldMetadata).type;
}

function isPicklist(typedCustomField: { type: string }) {
  return typedCustomField.type.toLowerCase() === 'picklist';
}

function toPickListValues(customField: MaybeTyped): string[] | undefined {
  if ('valueSet' in customField) {
    const valueSet = customField.valueSet as object;
    if ('valueSetDefinition' in valueSet) {
      const valueSetDefinition = valueSet.valueSetDefinition as object;
      if ('value' in valueSetDefinition) {
        const pickListValues = valueSetDefinition.value as Record<'fullName', string>[] | Record<'fullName', string>;
        if (isArrayOfValues(pickListValues)) {
          return pickListValues.filter((each) => 'fullName' in each).map((current) => current.fullName);
        } else {
          return [pickListValues.fullName];
        }
      }
    }
  }

  return undefined;
}

function isArrayOfValues(
  value: Record<string, unknown> | Record<string, unknown>[],
): value is Record<string, unknown>[] {
  return Array.isArray(value);
}
