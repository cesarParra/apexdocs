# SampleInterface Interface

`NAMESPACEACCESSIBLE`

This is a sample interface

**Author** John Doe

**Date** 2020-01-01

**See** [ns.SampleEnum](../Sample-Enums/ns.SampleEnum.md)

**See** [ns.ReferencedEnum](./ns.ReferencedEnum.md)

## Mermaid
```mermaid
graph TD
   A[SampleInterface] -->|extends| B[ParentInterface]
   B -->|extends| C[GrandParentInterface]
   C -->|extends| D[GreatGrandParentInterface]
```

## Example
```apex
SampleInterface sampleInterface = new SampleInterface();
sampleInterface.sampleMethod();
```

**Extends**
[ns.ParentInterface](./ns.ParentInterface.md)

## Methods
