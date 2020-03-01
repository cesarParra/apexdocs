# ApexDocs

<p align="center">
  <b>ApexDocs is a Node.js library with CLI capabilities to generate documentation for Salesforce Apex classes.</b>
</p>

[![License](https://img.shields.io/github/license/cesarParra/apexdocs)](https://github.com/cesarParra/apexdocs/blob/master/LICENSE)

## Description

ApexDocs was built as an alternative to the [Java based ApexDoc tool](https://github.com/SalesforceFoundation/ApexDoc) originally created by Aslam Bari and later maintained by Salesforce.org, as that tool is no longer being maintained.

ApexDocs is a Node.js library built on Typescript and hosted on [npm](https://www.npmjs.com/package/@cparra/apexdocs). It offers CLI capabilities to automatically generate a set of files that fully document each one of you classes. Additionally it can be imported and consumed directly by your JavaScript code.

There are some key differences between ApexDocs and the Java based ApexDoc tool:

- **Recursive file search through your module directory structure**. In an `sfdx` based project, all of your classes will be documented by specifying the top-most directory where file search should begin.
- **Unopinionated documentation site generation**. Instead of creating HTML files, ApexDocs generates a Markdown (.md) file per Apex class being documented. This means you can host your files in static web hosting services that parse Markdown like Github Pages or Netlify, and use site generators like Jekyll or Gatsby. This gives you the freedom to decide how to style your site to match your needs.

## Demo

- [Jekyll](https://cesarparra.github.io/apexdocs/) - Pages formatted for [Jekyll](https://jekyllrb.com/).
- [Docsify](https://cesarparra.github.io/apexdocs-docsify-example/) - Pages formatted for the [docsify](https://docsify.js.org/) site generator.

## Installation

```bash
npm i @cparra/apexdocs
```

## Usage

### CLI

Use the CLI tool to generate a static site using the following parameters:

| Parameter         | Alias | Description                                                                                                      | Default         | Required |
| ----------------- | ----- | ---------------------------------------------------------------------------------------------------------------- | --------------- | -------- |
| --sourceDir       | -s    | The directory location which contains your apex .cls classes.                                                    | N/A             | Yes      |
| --targetDir       | -t    | The directory location where documentation will be generated to.                                                 | `docs`          | No       |
| --recursive       | -r    | Whether .cls classes will be searched for recursively in the directory provided.                                 | `true`          | No       |
| --scope           | -p    | A list of scopes to document. Values should be separated by a space, e.g --scope public private                  | `global public` | No       |
| --targetGenerator | -g    | Define the static file generator for which the documents will be created. Currently supports jekyll and docsify. | `jekyll`        | No       |
| --configPath      | -c    | The path to the JSON configuration file that defines the structure of the documents to generate.                 | N/A             | No       |

#### Configuration File

You can optionally specify the path to a configuration JSON file through the `--configPath` parameter. This let's you embedd custom content into your home page, by using the `header` property to point to the a file which contents will be added to the top of the generated home page.

```
{
  "home": {
    "header": "./examples/includes/header.md"
  }
}
```

### Importing to your project

If you are just interested in the documentation parsing capabilities, you can import ApexDocs into your own project.

Use the `generate` function to create a list of `ClassModel` that includes all of the parsed information from your .cls files.

`generate(sourceDirectory[,recursive][,scope][,outputDir])`

- `sourceDirectory` \<string>
- `recursive` \<boolean>
- `scope` \<string[]>
- `outpurDir` \<string>

```javascript
var { generate } = require('@cparra/apexdocs');

let documentedClasses = generate('src', true, ['global'], 'docs');
```

## Typescript

ApexDocs provides all necessary type definitions.
