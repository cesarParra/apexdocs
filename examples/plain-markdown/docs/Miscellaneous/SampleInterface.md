# SampleInterface interface
Access: `public`

**Extends**
[ParentInterface](./ParentInterface.md)

`@NAMESPACEACCESSIBLE`

This is a sample interface

**Author** John Doe

**Date** 2020-01-01

**Mermaid** graph TD    A[SampleInterface] --&gt;|extends| B[ParentInterface]    B --&gt;|extends| C[GrandParentInterface]    C --&gt;|extends| D[GreatGrandParentInterface]

**See** [SampleEnum](../Sample-Enums/SampleEnum.md)

**See** [ReferencedEnum](./ReferencedEnum.md)

```mermaid
graph TD
   A[SampleInterface] --&gt;|extends| B[ParentInterface]
   B --&gt;|extends| C[GrandParentInterface]
   C --&gt;|extends| D[GreatGrandParentInterface]
```
