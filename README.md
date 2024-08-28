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

- [Expression](https://cesarparra.github.io/expression/)
- [Nimble AMS Docs](https://nimbleuser.github.io/nams-api-docs/#/api-reference/)
- [Yet Another Salesforce Logger](https://cesarparra.github.io/yet-another-salesforce-logger/#/)

## 🔬 Advanced Usage

### Available Commands

`markdown`

#### Flags

| Flag                          | Alias | Description                                                                                                                            | Default         | Required |
|-------------------------------|-------|----------------------------------------------------------------------------------------------------------------------------------------|-----------------|----------|
| `--sourceDir`                 | `-s`  | The directory where the source files are located.                                                                                      | N/A             | Yes      |
| `--targetDir`                 | `-t`  | The directory where the generated files will be placed.                                                                                | `docs`          | No       |
| `--scope`                     | `-p`  | A list of scopes to document. Values should be separated by a space, e.g --scope global public namespaceaccessible.                    | `global`        | No       |
| `--defaultGroupName`          | N/A   | The default group name to use when a group is not specified.                                                                           | `Miscellaneous` | No       |
| `--namespace`                 | N/A   | The package namespace, if any. If provided, it will be added to the generated files.                                                   | N/A             | No       |
| `--sortMembersAlphabetically` | N/A   | Sorts the members of a class, interface or enum alphabetically. If false, the members will be displayed in the same order as the code. | `false`         | No       |
| `--includeMetadata `          | N/A   | Whether to include the file's meta.xml information: Whether it is active and and the API version                                       | `false`         | No       |
| `--linkingStrategy`           | N/A   | The strategy to use when linking to other classes. Possible values are `relative`, `no-link`, and `none`                               | `relative`      | No       |

#### Sample Usage

```bash
apexdocs markdown -s force-app -t docs -p global public namespaceaccessible -n MyNamespace
```

`openapi`

#### Flags

| Flag           | Alias | Description                                                                   | Default         | Required |
|----------------|-------|-------------------------------------------------------------------------------|-----------------|----------|
| `--sourceDir`  | `-s`  | The directory where the source files are located.                             | N/A             | Yes      |
| `--targetDir`  | `-t`  | The directory where the generated files will be placed.                       | `docs`          | No       |
| `--fileName`   | N/A   | The name of the OpenApi file.                                                 | `openapi.json`  | No       |
| `--namespace`  | N/A   | The package namespace, if any. This will be added to the API file Server Url. | N/A             | No       |
| `--title`      | N/A   | The title of the OpenApi file.                                                | `Apex REST API` | No       |
| `--apiVersion` | N/A   | The version of the API.                                                       | `1.0.0`         | No       |

#### Sample Usage

```bash
apexdocs openapi -s force-app -t docs -n MyNamespace --title "My Custom OpenApi Title"
```

### Defining a configuration file

You can also use a configuration file to define the parameters that will be used when generating the documentation.
Apexdocs
uses [cosmiconfig](https://www.npmjs.com/package/cosmiconfig) to load the configuration file, which means it supports
the following formats:

- A `package.json` property, e.g. `{ "apexdocs": { "sourceDir": "src", "targetDir": "docs" } }`
- A `.apexdocsrc` file, written in YAML or JSON, with optional extensions: `.yaml/.yml/.json/.js`
- An `apexdocs.config.js` (or `.mjs`) file that exports an object
- A `apexdocs.config.ts` file that exports an object

The configuration file should be placed in the root directory of your project.

**Note that when using a configuration file, you can still override any of the parameters by passing them through the
CLI.**

When defining a `.js` or `.ts` configuration file, your object export can also contain the following functions that will
allow you to override some of the default behavior:

// TODO

### Importing to your project

If you are just interested in the Apex parsing capabilities, you can use the
standalone [Apex Reflection Library](https://www.npmjs.com/package/@cparra/apex-reflection)
which is what gets used by this library behind the scenes to generate the documentation files.

## 📖 Documentation Guide

ApexDocs picks up blocks of comments throughout your `.cls` files. The block must begin with `/**` and end with `*/`.

### Top-level files (classes, interfaces, and enums)

The following tags are supported at the file level:

**Note** Any custom generated tag is also supported. Custom tags can be added with at symbol (`@`) followed by the name
of the tag. For example `@custom-tag`

| Tag            | Description                             |
|----------------|-----------------------------------------|
| `@description` | One or more lines describing the file.  |
| `@see`         | The name of a related file.             |
| `@group`       | The group to which the file belongs to. |
| `@author`      | The author of the file.                 |
| `@date`        | The date the file was created.          |

**Example**

```apex
/**
 * @description This is my class description.
 */
public with sharing class TestClass {
}
```

### Enum Values

The following tags are supported on the enum value level:

| Tag            | Description                             |
|----------------|-----------------------------------------|
| `@description` | One or more lines describing the value. |

**Example**

```apex
public enum ExampleEnum {
    /** @description This is my enum value description. */
    VALUE_1,
    /** @description This is my other enum value description. */
    VALUE_2
}
```

### Properties and Fields

The following tags are supported on the property and field level:

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

### Methods and Constructors

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
| `@mermaid`                   | Diagrams in Mermaid format.                       |

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

### Code Blocks

// TODO -> Define how code can be added
// TODO -> Remember to mention that mermaid diagrams are supported using the same technique

### Custom Tags

You can use custom tags to document your code. Custom tags can be added with at symbol (`@`) followed by the name
of the tag. Apexdocs will automatically format tags which words are separated by a dash (`-`) by separating them with a
space and uppercasing them. For example, `@custom-tag` will be displayed as `Custom Tag`.

Within a custom tag, you can also add code blocks by using the triple backtick syntax. This is useful when you want to
display code snippets within your documentation.

**Example**

```apex
   /**
    * @custom-tag This is a custom tag
    * @custom-tag-with-code
    * ```
    * System.debug('Hello World');
    * ```
    */
public class MyClass {
}
```

Note that the language of the code block will be set to `apex` by default, but you can change it by adding the language
name after the triple backticks. For example, to display a JavaScript code block you can use:

```apex
   /**
    * @custom-tag-with-code
    * ```javascript
    * console.log('Hello World');
    * ```
    */
public class MyClass {
}
```

### Inline Linking

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
public static Object doSomething(ExampleClass param1) {
}
```

---

Email addresses can also be inlined linked by using the `{@email EMAIL_ADDRESS}` syntax.

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

### Ignoring files and members

You can ignore files and members by using the `@ignore` tag on any ApexDoc block. If used at the class level, the entire
file will be ignored. If used at the member level, only that member will be ignored.

Example

 ```apex
 /**
  * @ignore
  */
public class MyClass {
    public static void myMethod() {
    }
}
 ```

## 📄 Generating OpenApi REST Definitions

ApexDocs supports generating OpenApi 3.1.0 REST definitions based on any `@RestResource` classes in your source code.

### Usage

To create an OpenApi specification file, run `apexdocs openapi`
When using this generator, you can also pass a custom title through the `--title` parameter.
This title will be placed in the output file's `info.title` property,
as defined by the [OpenApi documentation for the Info Object](https://spec.openapis.org/oas/v3.1.0#info-object)

```shell
apexdocs openapi -s ./src -t docs --title "Custom OpenApi Title"
```

### How It Works

When generating an OpenApi document,
ApexDocs will run through all classes annotated with `@RestResource` and add it to the output OpenApi file.

Once it finishes running, a file named `openapi.json` (unless a different name is specified) will be created
in the specified `--targetDir`.

### Configuring What Gets Created

ApexDocs will automatically parse your source code and generate the OpenApi definition based on the HTTP related Apex
annotations (`RestResource`, `HttpDelete`, `HttpGet`, `HttpPatch`, `HttpPost`, `HttpGet`). The different HTTP
annotations will be used to generate a file that complies with
the [OpenApi Specification v3.1.0](https://spec.openapis.org/oas/v3.1.0)

Besides these annotations, the ApexDocs tool will also use any information provided through your code's Apexdocs,
relying on
some custom annotations that are specific to generating OpenApi definitions:

* `@http-request-body`
* `@http-parameter`
* `@http-response`

#### @http-request-body

Allows you to specify the HTTP request's expected request body. It supports receiving a `description`,
whether it is `required` or not, and a `schema`, which defines the shape of the object that is expected.

📝 Note that only one `@http-request-body` should be defined per method. If you add more than one, only
a single one will be used when generating the OpenApi definition.

The `schema` can either be a reference to another class in your source code (see the `Class References` section below)
or a fully defined custom schema (See the `Custom Schemas` section below).

Example

```apex
/**
 * @description This is a sample HTTP Post method
 * @http-request-body
 * description: This is an example of a request body
 * required: true
 * schema: ClassName
 */
@HttpPost
global static void doPost() {
    ///...
}
```

📝 Note that each parameter of this annotation is expected to be on its own line. Parameters are treated as YAML,
so spacing is important.

#### @http-parameter

Allows you to specify any HTTP parameter expected by your method. It supports receiving a `name`,
an `in` as defined by the supported [Parameter Locations](https://spec.openapis.org/oas/v3.1.0#parameter-locations),
whether it is `required` or not, a `description`, and a `schema`.

📝 Note that you can specify as many `@http-parameter` annotations as needed.

Example

```apex
/**
 * @description This is a sample HTTP Post method
 * @return A String SObject.
 * @http-parameter
 * name: limit
 * in: query
 * required: true
 * description: Limits the number of items on a page
 * schema:
 *   type: integer
 * @http-parameter
 * name: complex
 * in: cookie
 * schema: MyClassName
 */
@HttpPost
global static String doPost() {
    // ..
}
```

📝 Note that each parameter of this annotation is expected to be on its own line. Parameters are treated as YAML,
so spacing is important.

#### @http-response

Allows you to specify any HTTP response returned by your method. It supports receiving a `statusCode` with the response
code,
a `description`, and a `schema`.

If no `description` is provided then one will be automatically built using the `statusCode`.

📝 Note that you can specify as many `@http-parameter` annotations as needed.

```apex
/**
 * @description This is a sample HTTP Post method
 * @return A String SObject.
 * @http-response
 * statusCode: 200
 * schema: SuccessfulResponseClassName
 * @http-response
 * statusCode: 500
 * description: Status Code 500 - An internal server error occurred.
 * schema:
 *   type: string
 */
@HttpPost
global static String doPost() {
    // ...
}
```

#### Class References

Whenever specifying a `schema` parameter, you can pass as a string the name of any class in your source code. This
class will be parsed by the ApexDocs tool and automatically converted to a reference in the resulting OpenApi
definition.

The tool will parse the class and create a reference that complies
with [Apex's support for User-Defined Types](https://developer.salesforce.com/docs/atlas.en-us.apexcode.meta/apexcode/apex_rest_methods.htm#ApexRESTUserDefinedTypes)

##### Reference Overrides

When dealing with references, there might be cases when you want to manually tell the parser what type of object a
property
or field is. For example, let's say we have a class that looks as follows

```apex
public class MyClass {
    public Object myObject;
    public Account myAccountRecord;
}
```

In this case `myObject` has a type of `Object`, and `myAccountRecord` is an SObject. Neither of these will be accurately
parsed when building the OpenApi definition, instead they will be simple be referenced as `object` without any
properties.

To accurately represent the shape of these objects, you can use the `@http-schema` annotation to essentially override
its
type during parsing. In this annotation you can specify the same thing you would in any `schema` property when dealing
with any
of the main `@http-*` methods, meaning a reference to another class, or a Custom Schema (as defined below).

```apex
public class MyClass {
    /**
     * @description This is a generic reference to another class 
     * @http-schema MyOtherClassName
     */
    public Object myObject;

    /**
     * @description This is a reference to an Account SObject
     * @http-schema
     * type: object
     * properties:
     *   Id:
     *     type: string
     *   Name:
     *     type: string
     *   CustomField__c:
     *     type: number
     */
    public Account myAccountRecord;
}
```

---

If dealing with a collection, you can also specify the name of the reference either using the `List` or `Set` syntax.

📝 When using List or Set syntax in the `schema` of the ApexDoc `@http-*` annotation, only collections one level
deep are supported (e.g. List<List<String>> is not supported). This is only a limitation when referencing collections
on the ApexDoc `schema` property directly, and is fully supported when multi-level collections are inside of a
referenced
class as part of your codebase.

Maps are not supported, as it is not possible to know which keys the map will contain, and thus it is not possible
to convert that to a valid specification. For this use case, define a Custom Schema as explained below.

```apex
/**
 * @description This is a sample HTTP Post method
 * @http-request-body
 * description: This is an example of a request body
 * schema: List<ClassName>
 */
@HttpPost
global static void doPost() {
    ///...
}
```

Inner class references are also supported, but note that you need to pass the full name of the reference,
by using the `ParentClassName.InnerClassName` syntax, even if the inner class resides on the same class as the HTTP
method
referencing it.

```apex
/**
 * @description This is a sample HTTP Post method
 * @http-request-body
 * description: This is an example of a request body
 * schema: ParentClass.InnerClass
 */
@HttpPost
global static void doPost() {
    ///...
}
```

#### Custom Schemas

For any `schema` parameter in any of the HTTP ApexDocs annotations, besides specifying the name of a class, you
can also specify a custom schema definition. The schema definition can either be for a primitive type, an `object` or an
`array`

**Primitives**

For primitives, you should specify the `type` and an optional `format`, as defined by
the [OpenApi Specification on Data Types](https://spec.openapis.org/oas/v3.1.0#data-types)

```apex
/**
 * ...
 * schema:
 *   type: string
 *   format: password
 */
```

**Objects**

To specify a custom object schema, use `object` as the `type`, and specify as many properties as follows:

```apex
/**
 * schema:
 *   type: object
 *   properties:
 *     id:
 *       type: string
 *       description: The super Id.
 *     name:
 *       type: string
 *     phone:
 *       type: string
 *       format: byte
*/
```

Properties can be defined as primitives (as explained above), other objects, or arrays (explained below)

**Arrays**

To specify a custom array schema, use `array` as the `type`, and provide an `items` definition. In `items`
you can specify the definition of any other custom type (primitives, objects, or other arrays).

```apex
/**
 * schema:
 *   type: array
 *   items:
 *     type: object
 *     properties:
 *       name:
 *         type: string
 */
```

#### SObject References

ApexDocs is not able to automatically parse SObject references, as it can with class references, as it does
not reach into your org to get existing SObject describes. Because of this, when dealing with SObject references
you should create a Custom Schema as defined above. This will also allow you to specify which specific
fields are being received or returned.

### Considerations

Please be aware of the following when using ApexDocs to create an OpenApi definition:

* Map references are resolved as `object` with no properties, as it is not possible to know which keys the map will
  contain.
  When using maps either create a class that better represents the shape of the object and use a Class Reference, or
  define a Custom Schema in the `schema` section of the ApexDoc itself.
* Same thing when referencing SObjects, as SObject describe parsing is not supported by the ApexDocs tool. When
  referencing
  SObjects, consider defining a Custom Schema in the `schema` section of the ApexDoc.
* ApexDoc is only able to parse through your source code, so references to other packages (namespaced classes) or any
  code that lives outside your source code is not supported. Consider creating a Custom Schema for those situations.
* The return value and received parameters or your methods are currently not being considered when creating the OpenApi
  definition file.
  Instead, use the `@http-response` ApexDoc annotation to specify the return value, and `@http-parameter` to specify any
  expected parameter.

## 👨‍💻 Typescript

ApexDocs provides all necessary type definitions.

---

## ⏮️ 2.X

Looking for documentation for version 2.X? // TODO: Add link to the 2.X branch


