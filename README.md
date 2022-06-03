# ApexDocs

<p align="center">
  <b>ApexDocs is a Node.js library with CLI capabilities to docGenerator documentation for Salesforce Apex classes.</b>
</p>

[![License](https://img.shields.io/github/license/cesarParra/apexdocs)](https://github.com/cesarParra/apexdocs/blob/master/LICENSE)

## Description

ApexDocs was originally built as an alternative to
the [Java based ApexDoc tool](https://github.com/SalesforceFoundation/ApexDoc) originally created by Aslam Bari and
later maintained by Salesforce.org, as that tool is no longer being maintained.

ApexDocs is a Node.js library built on Typescript and hosted on [npm](https://www.npmjs.com/package/@cparra/apexdocs).
It offers CLI capabilities to automatically docGenerator a set of files that fully document each one of you classes.
Additionally, it can be imported and consumed directly by your JavaScript code.

There are some key differences between ApexDocs and the Java based ApexDoc tool:

- **Recursive file search through your module directory structure**. In an `sfdx` based project, all of your classes
  will be documented by specifying the top-most directory where file search should begin.
- **Unopinionated documentation site generation**. Instead of creating HTML files, ApexDocs generates a Markdown (.md)
  file per Apex class being documented. This means you can host your files in static web hosting services that parse
  Markdown like Github Pages or Netlify, and use site generators like Jekyll or Gatsby. This gives you the freedom to
  decide how to style your site to match your needs.

## Version 2.X

Version shares almost* all the same functionality (and more) of 1.X , but is a rewrite from the ground up of the tool,
so please be aware if migrating from a 1.X version.

The Apex code parsing logic for the 1.X codebase was almost a one-to-one translation of the Java based ApexDoc tool to
Javascript. With 2.X the parsing logic has been improved and extracted out of this codebase, and into its own standalone
NPM module which is solely focused on Apex code reflection: https://www.npmjs.com/package/@cparra/apex-reflection

This allows for an improved code quality of both code bases and an increased ease of introducing future improvements and
fixing issues.

### Differences between the versions

When migrating from 1.X please be aware of these changes between the major versions:

#### Deprecated features

* The `--group` CLI parameter has been deprecated. All files are grouped by default.

#### Features from 1.X not supported in 2.X

* The `--configPath` CLI parameter has been temporarily deprecated. We are planning on reintroducing it but the config
  file will use a different format.

#### New features

* All Apex annotations are now supported through the `--scope` CLI parameter, not just `namespaceaccessible`. This means
  that scopes like `auraenabled`, `invocablemethod`, `invocablevariable`, `remoteaction`, and all other valid Apex
  annotations are supported.
* Just like Javadoc, both `@throws` and `@exception` are supported when referencing an exception thrown by a method or
  constructor.
* Any custom annotation defined in the Apexdoc is at the class level are supported, for example the following will be
  output to the resulting markdown file:

```apex
/**
 * @MyCustomAnnotation This is a custom annotation
 */
public class MyClass {
}
```

* Apex docs blocks can now all be in a single line
* Support for grouping blocks of related code within a class
* Support for HTML tags
* And more!

### Demo

ApexDocs currently supports generating markdown files for Jekyll and Docsify sites, as well as generating plain markdown files.

### In the wild

- [Nimble AMS Docs](https://nimbleuser.github.io/nams-api-docs/#/api-reference/)
- [Yet Another Salesforce Logger](https://cesarparra.github.io/yet-another-salesforce-logger/#/)

### [Docsify](https://docsify.js.org/)

Demo

- [Docsify](https://cesarparra.github.io/apexdocs/)

### [Jekyll](https://jekyllrb.com/)

Demo

- [Jekyll](https://cesarparra.github.io/apexdocs-docsify-example/)

## Installation

```bash
npm i -g @cparra/apexdocs
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

| Parameter          | Alias | Description                                                                                                                              | Default         | Required |
|--------------------|-------|------------------------------------------------------------------------------------------------------------------------------------------|-----------------|----------|
| --sourceDir        | -s    | The directory location which contains your apex .cls classes.                                                                            | N/A             | Yes      |
| --targetDir        | -t    | The directory location where documentation will be generated to.                                                                         | `docs`          | No       |
| --recursive        | -r    | Whether .cls classes will be searched for recursively in the directory provided.                                                         | `true`          | No       |
| --scope            | -p    | A list of scopes to document. Values should be separated by a space, e.g --scope public private                                          | `global`        | No       |
| --targetGenerator  | -g    | Define the static file generator for which the documents will be created. Currently supports: `jekyll`, `docsify`, and `plain-markdown`. | `jekyll`        | No       |
| --indexOnly        | N/A   | Defines whether only the index file should be generated.                                                                                 | `false`         | No       |
| --defaultGroupName | N/A   | Defines the `@group` name to be used when a file does not specify it.                                                                    | `Miscellaneous` | No       |


### Importing to your project

If you are just interested in the Apex parsing capabilities, you can use the
standalone [Apex Reflection Library](https://www.npmjs.com/package/@cparra/apex-reflection)
which is what gets used by this library behind the scenes to generate the documentation files.

## Documentation Format

ApexDocs picks up blocks of comments throughout your `.cls` files. The block must begin with `/**` and end with `*/`.

### Documenting Classes

The following tags are supported on the class level:

**Note** Any custom generated tag is also supported. Custom tags can be added with at symbol (`@`) followed by the name
of the tag. For example `@custom-tag`

| Tag            | Description                                                                                                                                |
|----------------|--------------------------------------------------------------------------------------------------------------------------------------------|
| `@description` | One or more lines describing the class.                                                                                                    |
| `@see`         | The name of a related class.                                                                                                               |
| `@group`       | The group to which the class belongs to.                                                                                                   |
| `@author`      | The author of the class. Note that this only gets added if it is explicitly defined through the configuration class that it should.        |
| `@date`        | The date the class was created. Note that this only gets added if it is explicitly defined through the configuration class that it should. |

**Example**

```apex
/**
 * @description This is my class description.
 */
public with sharing class TestClass {
}
```

### Documenting Enums

The following tags are supported on the enum level:

| Tag            | Description                            |
|----------------|----------------------------------------|
| `@description` | One or more lines describing the enum. |

**Example**

```apex
/**
 * @description This is my enum description.
 */
public Enum ExampleEnum {
    VALUE_1, VALUE_2
}
```

### Documenting Properties

The following tags are supported on the property level:

| Tag            | Description                                |
|----------------|--------------------------------------------|
| `@description` | One or more lines describing the property. |

**Example**

```apex
/**
 * @description This is my property description.
 */
public String ExampleProperty { get; set; }
```

### Documenting Methods and Constructors

Methods and constructors support the same tags.

The following tags are supported on the method level:

| Tag                          | Description                                       |
|------------------------------|---------------------------------------------------|
| `@description`               | One or more lines describing the method.          |
| `@param` _paramName_         | Description of a single parameter.                |
| `@return`                    | Description of the return value of the method.    |
| `@example`                   | Example of how the code can be used or called.    |
| `@throws` _ExceptionName_    | Description of an exception thrown by the method. |
| `@exception` _ExceptionName_ | Same as `@throws`. V2 only                        |

**Example**

```apex
/**
 * @description This is my method description.
 * @param action The action to execute.
 * @return The result of the operation.
 * @example
 * Object result = SampleClass.call('exampleAction');
 */
public static Object call(String action) {
}
```

### Grouping Declarations Within A Class

A class might have members that should be grouped together. For example, you can have a class for constants with
groups of constants that should be grouped together because they share a common behavior (e.g. different groups
of constants representing the possible values for different picklists.)

You can group things together within a class by using the following syntax:

```apex
// @start-group Group Name or Description
public static final String CONSTANT_FOO = 'Foo';
public static final String CONSTANT_BAR = 'Bar';
// @end-group
```

Groups of members are displayed together under their own subsection after its name or description.

Some notes about grouping:

* This is only supported on classes, NOT enums and interfaces
* Supports
    * Properties
    * Fields (variables and constants)
    * Constructors
    * Methods
* BUT only members of the same type are grouped together. For example,
  if you have a group that contains properties and methods the properties will be grouped together under Properties ->
  Group Name, and the methods will be grouped together under Methods -> Group Name
* Does not support inner types (inner classes, interfaces, and enums)
* It is necessary to use `// @end-group` whenever a group has been started, otherwise a parsing error will be raised for
  that file.

### Inline linking

Apexdocs allows you to reference other classes from anywhere in your docs, and automatically creates a link to that
class file for easy navigation.

Apexdocs recognizes 2 different syntax when linking files:

- Javadoc's `{@link FileName}` syntax
- A class name wrapped in between `<<` `>>`.

**Example**

```apex
/**
 * @description This is my method description. This method receives an <<ExampleClass>>.
 * @param param1 An <<ExampleClass>> instance. Can also do {@link ExampleClass}
 * @return The result of the operation.
 */
public static Object class (ExampleClass param1) {
```

---

Email addresses can also be inlined linked by using the `{@email EMAIL_ADDRESS}` syntax.

### HTML support

For the most part all HTML is sanitized. But there are some tags are allowed to have for the possibility of better
styling long text.

- Allowed tags are: `br`, `p`, `ul`, and `li`

Example

```apex
/**
 * @description <p>This is a paragraph</p>
 * <p>And this is another paragraph</p>
 * <ul>
 *     <li>This is a list item</li>
 *     <li>This is another list item</li>
 * </ul>
 */
class MyClass {
}
```

## Typescript

ApexDocs provides all necessary type definitions.

---

## 1.X
Looking for documentation for version 1.X? Please refer to its [branch](https://github.com/cesarParra/apexdocs/tree/1.x)
