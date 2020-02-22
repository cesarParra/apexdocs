# apexdocs
Apex docs generator

TODO: 

[] Make VS Code's setting match the linter/prettier
[] Refactor index.ts
[] Unit tests
[] Fix lint issues
[] Publish to npm
[] Implement multiple files support
[] @group annotation support
    [] Create files in different directories per group
[] Separate JSON/Object creation module from doc creation module.
    Just getting the raw output our of files it's in own functionality, then anyone can decide how to use that
    so we want to separate that into its own thing, and then implement the .md generator separately from that
[] Generic way to create files.
    Implement a generic mechanism of file generation. Implementations can include creation of .md files and creation of static HTML
    files, but other implementors can decide to implement something else.
