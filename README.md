# ApexDocs

<div align="center">
  <b>CLI and Node library to generate documentation for Salesforce Apex classes.</b>

[![CI](https://github.com/cesarParra/apexdocs/actions/workflows/ci.yaml/badge.svg)](https://github.com/cesarParra/apexdocs/actions/workflows/ci.yaml)
[![License](https://img.shields.io/github/license/cesarParra/apexdocs)](https://github.com/cesarParra/apexdocs/blob/master/LICENSE)
[![npm](https://img.shields.io/npm/dm/@cparra/apexdocs)](https://www.npmjs.com/package/@cparra/apexdocs)
</div>

ApexDocs is a non-opinionated documentation generator for Salesforce Apex classes.
It can output documentation in Markdown
format,
which allows you to use the Static Site Generator of your choice to create a documentation site that fits your needs,
hosted in any static web hosting service.

## 💿 Installation

```bash
npm i -g @cparra/apexdocs
```

## ⚡ Quick Start

### CLI

#### Markdown

Run the following command to generate markdown files for your global Salesforce Apex classes:

```bash
apexdocs markdown -s force-app
```

#### OpenApi

Run the following command to generate an OpenApi REST specification for your Salesforce Apex classes
annotated with `@RestResource`:

```bash
apexdocs openapi -s force-app
```

## 🚀 Features

* Generate documentation for Salesforce Apex classes as Markdown files
* Generate an OpenApi REST specification based on `@RestResource` classes
* Support for grouping blocks of related code within a class
* Support for ignoring files and members from being documented
* Namespace support
* Configuration file support
* Single line ApexDoc Blocks
* Custom tag support
* And much, much more!

## 👀 Demo

ApexDocs generates Markdown files, which can be integrated into any Static Site Generation engine,
(e.g. Jekyll, Vitepress, Hugo, Docosaurus, etc.) to create a documentation site that fits your needs.

This repo contains several example implementations in the `examples` directory, showcasing how to integrate
with some of these tools.

* [Examples](./examples)

### In the wild

Here are some live projects using ApexDocs:

- [Trailhead Apex Recipes](https://github.com/trailheadapps/apex-recipes)
- [Salesforce Commerce Apex Reference](https://developer.salesforce.com/docs/commerce/salesforce-commerce/references/comm-apex-reference/cart-reference.html)
- [Expression (API)](https://cesarparra.github.io/expression/)
- [Nimble AMS Docs](https://nimbleuser.github.io/nams-api-docs/#/api-reference/)

## ▶️ Available Commands

`markdown`

### Flags

| Flag                   | Alias | Description                                                                                                                                                                                              | Default         | Required |
|------------------------|-------|----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|-----------------|----------|
| `--sourceDir`          | `-s`  | The directory where the source files are located.                                                                                                                                                        | N/A             | Yes      |
| `--targetDir`          | `-t`  | The directory where the generated files will be placed.                                                                                                                                                  | `docs`          | No       |
| `--scope`              | `-p`  | A list of scopes to document. Values should be separated by a space, e.g --scope global public namespaceaccessible.                                                                                      | `global`        | No       |
| `--defaultGroupName`   | N/A   | The default group name to use when a group is not specified.                                                                                                                                             | `Miscellaneous` | No       |
| `--namespace`          | N/A   | The package namespace, if any. If provided, it will be added to the generated files.                                                                                                                     | N/A             | No       |
| `--sortAlphabetically` | N/A   | Sorts files appearing in the Reference Guide alphabetically, as well as the members of a class, interface or enum alphabetically. If false, the members will be displayed in the same order as the code. | `false`         | No       |
| `--includeMetadata `   | N/A   | Whether to include the file's meta.xml information: Whether it is active and and the API version                                                                                                         | `false`         | No       |
| `--linkingStrategy`    | N/A   | The strategy to use when linking to other classes. Possible values are `relative`, `no-link`, and `none`                                                                                                 | `relative`      | No       |

#### Linking Strategy

The linking strategy determines how ApexDocs will link to other classes in your documentation. For example,
if I have class `A` that links through class `B` (e.g. through an `{@link B}` tag, the `@see` tag,
takes it as a param, returns it from a method, etc.), the linking strategy will determine how the link to class `B` is
created.

These are the possible values for the `linkingStrategy` flag:

- `relative`

Create a relative link to the class file.
So if both classes are in the same directory, the link will be created as
`[B](B.md)`.
If the classes are in different directories, the link will be created as `[B](../path/to/B.md)`

- `no-link`

Does not create a link at all. The class name will be displayed as plain text.

- `none`

Does not apply any kind of logic. Instead, the links will be determined by the path to the file
from the root of the documentation site OR by whatever path you have returned in the `transformReference` hook
for the file.

### Sample Usage

```bash
apexdocs markdown -s force-app -t docs -p global public namespaceaccessible -n MyNamespace
```

`openapi`

### Flags

| Flag           | Alias | Description                                                                   | Default         | Required |
|----------------|-------|-------------------------------------------------------------------------------|-----------------|----------|
| `--sourceDir`  | `-s`  | The directory where the source files are located.                             | N/A             | Yes      |
| `--targetDir`  | `-t`  | The directory where the generated files will be placed.                       | `docs`          | No       |
| `--fileName`   | N/A   | The name of the OpenApi file.                                                 | `openapi.json`  | No       |
| `--namespace`  | N/A   | The package namespace, if any. This will be added to the API file Server Url. | N/A             | No       |
| `--title`      | N/A   | The title of the OpenApi file.                                                | `Apex REST API` | No       |
| `--apiVersion` | N/A   | The version of the API.                                                       | `1.0.0`         | No       |

### Sample Usage

```bash
apexdocs openapi -s force-app -t docs -n MyNamespace --title "My Custom OpenApi Title"
```

## 🔬 Defining a configuration file

You can also use a configuration file to define the parameters that will be used when generating the documentation.

Configuration files are the main way to integrate the generated documentation with the Static Site Generator of your
choice and your build process, as well as configuring any custom behavior and the output of the generated files.

### Overview

Apexdocs uses [cosmiconfig](https://www.npmjs.com/package/cosmiconfig) to load the configuration file, which means it
supports the following formats (plus anything else supported by cosmiconfig):

- A `package.json` property, e.g. `{ "apexdocs": { "sourceDir": "src", "targetDir": "docs" } }`
- A `.apexdocsrc` file, written in YAML or JSON, with optional extensions: `.yaml/.yml/.json/.js`
- An `apexdocs.config.js` (or `.mjs`) file that exports an object
- A `apexdocs.config.ts` file that exports an object

**The configuration file should be placed in the root directory of your project.**

**Note that when using a configuration file, you can still override any of the parameters by passing them through the
CLI.**

### Configuration file

When defining a configuration file, it is recommended to use ES modules syntax. The config file should `default`
export an object with the parameters you want to use.:

```javascript
export default {
  sourceDir: 'force-app',
  targetDir: 'docs',
  scope: ['global', 'public'],
  ...
}
```

Every property in the configuration file is optional, and if not provided, either the value provided through the
CLI will be used, or the default value will be used.

### Config Intellisense

Using the `defineMarkdownConfig` (or the `defineOpenApiConfig` for OpenApi documentation) 
helper will provide Typescript-powered intellisense
for the configuration file options. This should work with both Javascript and Typescript files.

```typescript
import { defineMarkdownConfig } from "@cparra/apexdocs";

export default defineMarkdownConfig({
  sourceDir: 'force-app',
  targetDir: 'docs',
  scope: ['global', 'public'],
  ...
});
```

### Excluding Tags from Appearing in the Documentation

You can exclude tags from appearing in the documentation by using the `excludeTags` property in the configuration file,
which allow you to pass a list of tags that you want to exclude from the documentation.

```typescript
import { defineMarkdownConfig } from "@cparra/apexdocs";

export default defineMarkdownConfig({
  sourceDir: 'force-app',
  targetDir: 'docs',
  scope: ['global', 'public'],
  excludeTags: ['internal', 'ignore'],
  ...
});
```

### Configuration Hooks

When defining a `.js` or `.ts` configuration file, your object export can also make use
of different hooks that will be called at different stages of the documentation generation process.

All hooks can be async functions, allowing you to make asynchronous operations, like calling an external API.

📒 Note: The extension hook functions are only available when generating Markdown files (not OpenApi).

#### **transformReferenceGuide**

Allows changing the Allows changing the frontmatter and content of the reference guide, or even if creating a reference
guide page should be skipped.

**Type**

```typescript
type TransformReferenceGuide = (referenceGuide: ReferenceGuidePageData) => Partial<ReferenceGuidePageData> | Skip | Promise<Partial<ReferenceGuidePageData> | Skip>;
```

Example: Updating the frontmatter

```typescript
export default {
  transformReferenceGuide: (referenceGuide) => {
    return {
      // The frontmatter can either be an object, of the frontmatter string itself
      frontmatter: { example: 'example' }
    };
  }
};
```

Example: skipping the reference guide

```typescript
// The skip function is imported from the package
import { defineMarkdownConfig, skip } from "@cparra/apexdocs";

export default defineMarkdownConfig({
  transformReferenceGuide: (referenceGuide) => {
    return skip();
  }
});
```

#### **transformDocs**

The main purpose of this hook is to allow you to skip the generation of specific pages,
by returning a filtered array of `DocPageData` objects.

If you want to modify the contents or frontmatter of the docs, use the `transformDocPage` hook instead.

**Type**

```typescript
type TransformDocs = (docs: DocPageData[]) => DocPageData[] | Promise<DocPageData[]>
```

Example

```typescript
export default {
  transformDocs: (docs) => {
    return docs.filter(doc => doc.name !== 'MyClass');
  }
};
```

#### **transformDocPage**

Allows changing the frontmatter and content of the doc page.

**Type**

```typescript
type TransformDocPage = (
  doc: DocPageData,
) => Partial<ConfigurableDocPageData> | Promise<Partial<ConfigurableDocPageData>>
```

Example

```typescript
export default {
  transformDocPage: (doc) => {
    return {
      frontmatter: { example: 'example' }
    };
  }
};
```

#### **transformReference**

Allows changing where the files are written to and how files are linked to each other.

**Type**

```typescript
type TransformReference = (
  reference: DocPageReference,
) => Partial<ConfigurableDocPageReference> | Promise<ConfigurableDocPageReference>;
```

Example

```typescript
export default {
  // Notice how we are setting the linking strategy to none, so that nothing is done
  // to the links by the tool when it tries to link to other classes
  linkingStrategy: 'none',
  transformReference: (reference) => {
    return {
      // Link to the class in Github instead to its doc page.
      referencePath: `https://github.com/MyOrg/MyRepo/blob/main/src/classes/${reference.name}.cls`
    };
  }
};
```

## ⤵︎ Importing to your project

### Reflection

If you are just interested in the Apex parsing capabilities, you can use the
standalone [Apex Reflection Library](https://www.npmjs.com/package/@cparra/apex-reflection)
which is what gets used by this library behind the scenes to generate the documentation files.

### Processing

If you would like to use the processing capabilities of ApexDocs directly from Javascript/Typescript
instead of using the CLI, you can import the `process` function from the library.

```typescript
import { process } from '@cparra/apexdocs';

process({
  sourceDir: 'force-app',
  targetDir: 'docs',
  scope: ['global', 'public'],
  ...
});
```

### 👨‍💻 Typescript

If using Typescript, ApexDocs provides all necessary type definitions.

## 📖 Documentation Guide

See the [wiki](https://github.com/cesarParra/apexdocs/wiki/%F0%9F%93%96-Documenting-Apex-code)
for an in-depth guide on how to document your Apex code to get the most out of ApexDocs.

## 📄 Generating OpenApi REST Definitions

ApexDocs can also generate OpenApi REST definitions for your Salesforce Apex classes annotated with `@RestResource`.

See the [wiki](https://github.com/cesarParra/apexdocs/wiki/%F0%9F%93%84-Generating-OpenApi-REST-Definitions)
for more information.
