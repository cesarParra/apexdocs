# SampleInterface Interface

`NAMESPACEACCESSIBLE`

This is a sample interface

**Author** John Doe

**Date** 2020-01-01

**See** [ns.SampleEnum](../Sample-Enums/ns.SampleEnum.md)

**See** [ns.ReferencedEnum](./ns.ReferencedEnum.md)

## Diagram
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
### `sampleMethod()`

`NAMESPACEACCESSIBLE`

This is a sample method

**Custom Tag** This is a custom tag

**Another Custom Tag** This is another custom tag

#### Signature
```apex
public String sampleMethod()
```

#### Return Type
**String**

Some return value

#### Throws
[ns.SampleException](./ns.SampleException.md): This is a sample exception

AnotherSampleException: This is another sample exception

#### Diagram
```mermaid
graph TD
  A[SampleInterface] -->|extends| B[ParentInterface]
  B -->|extends| C[GrandParentInterface]
  C -->|extends| D[GreatGrandParentInterface]
```

#### Example
```apex
SampleInterface sampleInterface = new SampleInterface();
sampleInterface.sampleMethod();
```

---

### `sampleMethodWithParams(param1, param2, theEnum)`

`NAMESPACEACCESSIBLE`
`DEPRECATED`

This is a sample method with parameters 

Sometimes it won&#x27;t be possible to find a NonExistent link.

#### Signature
```apex
public SampleEnum sampleMethodWithParams(String param1, Integer param2, SampleEnum theEnum)
```

#### Parameters
| Name | Type | Description |
|------|------|-------------|
| param1 | String | This is the first parameter |
| param2 | Integer | This is the second parameter |
| theEnum | [ns.SampleEnum](../Sample-Enums/ns.SampleEnum.md) | This is an enum parameter |

#### Return Type
**[ns.SampleEnum](../Sample-Enums/ns.SampleEnum.md)**

Some return value

---

### `sampleParentMethod()`

*Inherited*

#### Signature
```apex
public void sampleParentMethod()
```

#### Return Type
**void**
