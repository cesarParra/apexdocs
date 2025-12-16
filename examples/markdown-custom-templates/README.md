# Custom Templates Example

This example demonstrates the custom template functionality in ApexDocs, which allows you to customize the
output format of your generated documentation.

## Overview

ApexDocs custom template feature enables you to define your own templates for different renderable types (classes,
interfaces, enums, triggers, LWC, custom objects, and reference guides). You can use either:

1. **String templates** - Handlebars syntax templates
2. **Function templates** - TypeScript/JavaScript functions that return strings

## Configuration File

The main configuration is in `apexdocs.config.ts`. Head over there to see how custom templates 
are defined.

## Getting started with this example

1. Navigate to the example directory:

```bash
cd examples/markdown-custom-templates
```

2. Install dependencies:

```bash
npm install
```

3. Generate documentation with custom templates:

```bash
npm run docs:gen
```

The generated documentation will be available in the `docs/` directory.
