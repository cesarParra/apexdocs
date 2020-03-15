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

ApexDocs currently supports generating markdown files for Jekyll and Docsify sites.

### [Jekyll](https://jekyllrb.com/)

Demo

- [Jekyll](https://cesarparra.github.io/apexdocs/)

### [Docsify](https://docsify.js.org/)

Demo

- [Docsify](https://cesarparra.github.io/apexdocs-docsify-example/)

## Installation

```bash
npm i @cparra/apexdocs
```

## Usage

### CLI

```bash
apexdocs-generate
    -s src
    -t docs
    -p global
    -g docsify
```

The CLI supports the following parameters:

| Parameter         | Alias | Description                                                                                                      | Default         | Required |
| ----------------- | ----- | ---------------------------------------------------------------------------------------------------------------- | --------------- | -------- |
| --sourceDir       | -s    | The directory location which contains your apex .cls classes.                                                    | N/A             | Yes      |
| --targetDir       | -t    | The directory location where documentation will be generated to.                                                 | `docs`          | No       |
| --recursive       | -r    | Whether .cls classes will be searched for recursively in the directory provided.                                 | `true`          | No       |
| --scope           | -p    | A list of scopes to document. Values should be separated by a space, e.g --scope public private                  | `global public` | No       |
| --targetGenerator | -g    | Define the static file generator for which the documents will be created. Currently supports jekyll and docsify. | `jekyll`        | No       |
| --configPath      | -c    | The path to the JSON configuration file that defines the structure of the documents to generate.                 | N/A             | No       |
| --group           | -o    | Define whether the generated files should be grouped by the @group tag on the top level classes.                 | `true`          | No       |

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

## Documentation Format

ApexDocs picks up blocks of comments throughout your `.cls` files. The block must begin with `/**` and span through multiple lines, ending with `*/`.

### Documenting Classes

The following tags are supported on the class level:

| Tag            | Description                              |
| -------------- | ---------------------------------------- |
| `@description` | One or more lines describing the class.  |
| `@see`         | The name of a related class.             |
| `@group`       | The group to which the class belongs to. |

**Example**

```java
/**
 * @description This is my class description.
 */
 public with sharing class TestClass { }
```

### Documenting Properties

The following tags are supported on the property level:

| Tag            | Description                                |
| -------------- | ------------------------------------------ |
| `@description` | One or more lines describing the property. |

**Example**

```java
/**
 * @description This is my property description.
 */
 public String ExampleProperty { get; set; }
```

### Documenting Methods and Constructors

Methods and constructors support the same tags.

The following tags are supported on the method level:

| Tag                  | Description                                    |
| -------------------- | ---------------------------------------------- |
| `@description`       | One or more lines describing the method.       |
| `@param` _paramName_ | Description of a single parameter.             |
| `@return`            | Description of the return value of the method. |
| `@example`           | Example of how the code can be used or called. |

**Example**

```java
/**
 * @description This is my method description.
 * @param action The action to execute.
 * @return The result of the operation.
 * @example
 * Object result = SampleClass.call('exampleAction');
 */
 public static Object call(String action) {
```

## Typescript

ApexDocs provides all necessary type definitions.
