[] Automatic Resolution of links (@see and {@link FileName})

[] Respect access modifiers where the properties/methods are different from the class declaration. For example,
AuraEnabled properties do not live in an AuraEnabled class, so there's no way to just generate docs to showcase the
AuraEnabled properties of a class without some sort of combination of also exposing other public/globals

[] Versioning capabilities. When creating the doc you specify a version number, and a new directory is created for the
files, instead of just overriding

[] New generatortype: To JsDocs from AuraEnabled

[] More unit tests

[] config.js support to allow for injections, home header, etc.

[] Add configuration setting that allows someone to set the "namespace"

[] Homepage support similar to what docsify does
