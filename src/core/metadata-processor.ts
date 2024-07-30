import { XMLParser } from 'fast-xml-parser';

// TODO: We don't need a class when this can just be a function
export default class MetadataProcessor {
  public static process(input: string) {
    const map = new Map<string, string>();
    const xml = new XMLParser().parse(input);

    map.set('apiVersion', xml.ApexClass.apiVersion ?? '');

    if (xml.ApexClass.status) {
      map.set('status', xml.ApexClass.status);
    }

    return map;
  }
}
