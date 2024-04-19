import { MarkdownTranspilerBase } from '../markdown-transpiler-base';
import { Type } from '@cparra/apex-reflection';
import { MarkdownHomeFile } from '../../../model/markdown-home-file';
import { MarkdownTypeFile } from '../../../model/markdown-type-file';
import { LinkingStrategy } from '../../processor-type-transpiler';
import { Settings } from '../../../settings';

export class JekyllDocsProcessor extends MarkdownTranspilerBase {
  homeFileName(): string {
    return 'index';
  }

  onBeforeProcess = (types: Type[]) => {
    this._fileContainer.pushFile(new MarkdownHomeFile(this.homeFileName(), types, this.frontMatterForHomeFile));
  };

  onProcess(type: Type): void {
    this._fileContainer.pushFile(new MarkdownTypeFile(type, 1, this.getFrontMatterHeader(type)));
  }

  get frontMatterForHomeFile(): string {
    return '---\nlayout: default\n---';
  }

  getFrontMatterHeader(type: Type): string {
    const headerLines = ['---'];
    // "layout: default" is a required front matter header for Jekyll
    headerLines.push('layout: default');
    // Add any additional front matter headers that might have been configured in the settings
    const targetType = {
      name: type.name,
      typeName: type.type_name,
      accessModifier: type.access_modifier,
      group: type.group,
      description: type.docComment?.description,
    };
    const configuredHeaders = Settings.getInstance().frontMatterHeader(targetType);
    if (configuredHeaders) {
      configuredHeaders.forEach((header) => {
        headerLines.push(header);
      });
    }
    headerLines.push('---');
    return headerLines.join('\n');
  }

  getLinkingStrategy(): LinkingStrategy {
    return 'path-relative';
  }
}
