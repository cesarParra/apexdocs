import { OutputFile } from '../../model/outputFile';

export class MarkdownFile extends OutputFile {
  fileExtension(): string {
    return '.md';
  }

  public addText(text: string) {
    super.addText(text);
    return this;
  }
}
