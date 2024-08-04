# SampleEnum Enum

`NAMESPACEACCESSIBLE`

This is a sample enum. This references [ReferencedEnum](../Miscellaneous/ReferencedEnum.md) . 

This description has several lines

**Some Custom** 

Test. I can also have a [ReferencedEnum](../Miscellaneous/ReferencedEnum.md) here. 

And it can be multiline.

**Group** Sample Enums

**Author** John Doe

**Date** 2022-01-01

**See** [ReferencedEnum](../Miscellaneous/ReferencedEnum.md)

## Diagram
```mermaid
graph TD
 A[SampleEnum] -->|references| B[ReferencedEnum]
 B -->|referenced by| A
```

## Values
| Value | Description |
|-------|-------------|
| VALUE1 | This is value 1 |
| VALUE2 | This is value 2 |
| VALUE3 | This is value 3 |