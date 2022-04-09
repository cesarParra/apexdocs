import { XMLParser } from 'fast-xml-parser';

export default class MetadataProcessor {
  public static process(input: string) {
    const map = new Map<string, string>();
    const xml = new XMLParser().parse(input);

    map.set('apiVersion', xml.ApexClass.apiVersion ?? '');

    map.set('status', xml.ApexClass.status ?? '');
    return map;
  }
}
