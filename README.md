# ApexDocs

<p align="center">
  <b>ApexDocs is a Node.js library with CLI capabilities to generate documentation for Salesforce Apex classes.</b>
</p>

[![License](https://img.shields.io/github/license/cesarParra/apexdocs)](https://github.com/cesarParra/apexdocs/blob/master/LICENSE)

## Description

ApexDocs was built as an alternative to the [Java based ApexDoc tool](https://github.com/SalesforceFoundation/ApexDoc)
originally created by Aslam Bari and later maintained by Salesforce.org, as that tool is no longer being maintained.

ApexDocs is a Node.js library built on Typescript and hosted on [npm](https://www.npmjs.com/package/@cparra/apexdocs).
It offers CLI capabilities to automatically generate a set of files that fully document each one of you classes.
Additionally, it can be imported and consumed directly by your JavaScript code.

There are some key differences between ApexDocs and the Java based ApexDoc tool:

- **Recursive file search through your module directory structure**. In an `sfdx` based project, all of your classes
  will be documented by specifying the top-most directory where file search should begin.
- **Unopinionated documentation site generation**. Instead of creating HTML files, ApexDocs generates a Markdown (.md)
  file per Apex class being documented. This means you can host your files in static web hosting services that parse
  Markdown like Github Pages or Netlify, and use site generators like Jekyll or Gatsby. This gives you the freedom to
  decide how to style your site to match your needs.

### Demo

ApexDocs currently supports generating markdown files for Jekyll and Docsify sites.

### In the wild

- [Nimble AMS Docs](https://nimbleuser.github.io/nams-api-docs/#/public-apis/)
- [Yet Another Salesforce Logger](https://cesarparra.github.io/yet-another-salesforce-logger/#/)

### [Docsify](https://docsify.js.org/)

Demo

- [Docsify](https://cesarparra.github.io/apexdocs-docsify-example/)

### [Jekyll](https://jekyllrb.com/)

Demo

- [Jekyll](https://cesarparra.github.io/apexdocs/)

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

| Parameter         | Alias | Description                                                                                                                                 | Default                             | Required |
| ----------------- | ----- | --------------------------------------------------------------------------------------------------------------------------------------------| ----------------------------------- | -------- |
| --sourceDir       | -s    | The directory or directories location(s) which contains your apex .cls classes. Multiple directories can be specified separated by spaces   | N/A                                 | Yes      |
| --targetDir       | -t    | The directory location where documentation will be generated to.                                                                            | `docs`                              | No       |
| --recursive       | -r    | Whether .cls classes will be searched for recursively in the directory provided.                                                            | `true`                              | No       |
| --scope           | -p    | A list of scopes to document. Values should be separated by a space, e.g --scope public private                                             | `global namespaceaccessible public` | No       |
| --targetGenerator | -g    | Define the static file generator for which the documents will be created. Currently supports jekyll and docsify.                            | `jekyll`                            | No       |
| --configPath      | -c    | The path to the JSON configuration file that defines the structure of the documents to generate.                                            | N/A                                 | No       |
| --group           | -o    | Define whether the generated files should be grouped by the @group tag on the top level classes.                                            | `true`                              | No       |

#### Configuration File

You can optionally specify the path to a configuration JSON file through the `--configPath` parameter. This let's you
have some additional control over the content outputs.

The configuration file allows you to specify the following:

_Note_: Everything in the configuration file is optional. When something is not specified, the default will be used.

`root` (String)

Default: None

Allows you to specify the root directory for where the files are being generated. This can be helpful when embedding the
generated docs into an existing site so that the links are generated correctly.

`defaultGroupName`

Default: Miscellaneous

Defines the `@group` name to be used when a file does not specify it.

`sourceLanguage`

Default: None

Defines the name of the language that will be used when generating `@example` blocks. Use this when you are interested
in using syntax highlighting for your project.

Even though the source code material for which documentation is generated is always `Apex`, generally you will be able
to use a syntax highlighter that recognizes `java` source code, so set this value to `java` in those cases.

`home` (Object)

Gives you control over the home page.

`home.header` (String)

Default: None

Allows you to embed custom content into your home page by using the `header` property to point to the a file which
contents will be added to the top of the generated home page.

Specify the path with the content that you want to embed.

`content` (Object)

Gives you control over the content pages.

`content.includeAuthor` (Boolean)

Default: false

Whether the `@author` tag should be used to add the file's author to the page.

`content.includeDate` (Boolean)

Default: false

Whether the `@date` tag should be used to add the file's date to the page.

`content.startingHeadingLevel` (Number)

Default: 1

The starting H tag level for the document. Each title will use this as the starting point to generate the
appropriate `<h#>` tag. For example, if set to 1, the class' file name at the top of the file will use an `<h1>` tag,
the `Properties` title will be `<h2>`, each property name will be an `<h3>`, etc.

```
{
  "root": "root-directory",
  "defaultGrouName": "api",
  "sourceLanguage": "java",
  "home": {
    "header": "./examples/includes/header.md"
  },
  "content": {
    "startingHeadingLevel": 1,
    "includeAuthor": true,
    "includeDate": true
  }
}
```

### Importing to your project

If you are just interested in the documentation parsing capabilities, you can import ApexDocs into your own project.

Use the `generate` function to create a list of `ClassModel` that includes all the parsed information from your .cls
files.

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

ApexDocs picks up blocks of comments throughout your `.cls` files. The block must begin with `/**` and span through
multiple lines, ending with `*/`.

### Documenting Classes

The following tags are supported on the class level:

| Tag            | Description                                                                                                                                |
| -------------- | ------------------------------------------------------------------------------------------------------------------------------------------ |
| `@description` | One or more lines describing the class.                                                                                                    |
| `@see`         | The name of a related class.                                                                                                               |
| `@group`       | The group to which the class belongs to.                                                                                                   |
| `@author`      | The author of the class. Note that this only gets added if it is explicitly defined through the configuration class that it should.        |
| `@date`        | The date the class was created. Note that this only gets added if it is explicitly defined through the configuration class that it should. |

**Example**

```java
/**
 * @description This is my class description.
 */
public with sharing

class TestClass {
}
```

### Documenting Enums

The following tags are supported on the enum level:

| Tag            | Description                            |
| -------------- | -------------------------------------- |
| `@description` | One or more lines describing the enum. |

**Example**

```java
/**
 * @description This is my enum description.
 */
public Enum ExampleEnum{VALUE_1,VALUE_2}
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
public String ExampleProperty{get;set;}
```

### Documenting Methods and Constructors

Methods and constructors support the same tags.

The following tags are supported on the method level:

| Tag                       | Description                                       |
| ------------------------- | ------------------------------------------------- |
| `@description`            | One or more lines describing the method.          |
| `@param` _paramName_      | Description of a single parameter.                |
| `@return`                 | Description of the return value of the method.    |
| `@example`                | Example of how the code can be used or called.    |
| `@throws` _ExceptionName_ | Description of an exception thrown by the method. |

**Example**

```java
/**
 * @description This is my method description.
 * @param action The action to execute.
 * @return The result of the operation.
 * @example
 * Object result = SampleClass.call('exampleAction');
 */
public static Object call(String action){
```

### Inline linking

Apexdocs allows you to reference other classes from anywhere in your docs, and automatically creates a link to that
class file for easy navigation.

Apexdocs recognizes 2 different syntax when linking files:

- Javadoc's `{@link FileName}` syntax
- A class name wrapped in between `<<` `>>`.

**Example**

```java
/**
 * @description This is my method description. This method receives an <<ExampleClass>>.
 * @param param1 An <<ExampleClass>> instance. Can also do {@link ExampleClass}
 * @return The result of the operation.
 */
public static Object class(ExampleClass param1){
```

## Typescript

ApexDocs provides all necessary type definitions.
