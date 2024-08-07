import { XMLParser } from 'fast-xml-parser';

export function parseApexMetadata(input: string) {
  const map = new Map<string, string>();
  const xml = new XMLParser().parse(input);

  map.set('apiVersion', xml.ApexClass.apiVersion ?? '');

  if (xml.ApexClass.status) {
    map.set('status', xml.ApexClass.status);
  }

  return map;
}
