import { XMLParser } from 'fast-xml-parser';
import * as E from 'fp-ts/Either';
import { pipe } from 'fp-ts/function';

type ApexMetadata = {
  ApexClass: ApexClassMetadata;
};

type ApexClassMetadata = {
  apiVersion: string;
  status?: string;
};

export function parseApexMetadata(input: string) {
  return pipe(input, parse, E.map(toMap));
}

function parse(input: string): E.Either<Error, ApexMetadata> {
  return E.tryCatch(() => new XMLParser().parse(input), E.toError);
}

function toMap(metadata: ApexMetadata): Map<string, string> {
  const map = new Map<string, string>();
  map.set('apiVersion', String(metadata.ApexClass.apiVersion));
  if (metadata.ApexClass.status) {
    map.set('status', String(metadata.ApexClass.status));
  }

  return map;
}
