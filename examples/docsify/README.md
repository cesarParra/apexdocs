# Docsify Example

This project contains an example on how to generate documentation to be rendered with [Docsify](https://docsify.js.org).

## Getting Started

* Follow the Docsify getting started instructions [here](https://docsify.js.org/#/quickstart).

## Configuration

Take a look at the `apexdocs.config.ts` file to see how the configuration is set up.

Pay special attention to the following:

* `linkingStrategy` -> This must be set to "none" for Docsify to correctly render the links.

* `transformReferenceGuide` -> Overrides the name of the `index` file to `README` so that Docsify can correctly render the home page.
