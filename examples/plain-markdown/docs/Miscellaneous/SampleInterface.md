# SampleInterface interface
Access: `public`

**Extends**
[ParentInterface](./ParentInterface.md)

`NAMESPACEACCESSIBLE`

This is a sample interface

**Author** John Doe

**Date** 2020-01-01

**See** [SampleEnum](../Sample-Enums/SampleEnum.md)

**See** [ReferencedEnum](./ReferencedEnum.md)

```mermaid
graph TD
   A[SampleInterface] --&gt;|extends| B[ParentInterface]
   B --&gt;|extends| C[GrandParentInterface]
   C --&gt;|extends| D[GreatGrandParentInterface]
```

## Methods
### `public String sampleMethod()`

`NAMESPACEACCESSIBLE`

This is a sample method

#### Returns
String: Some return value

#### Throws
SampleException: This is a sample exception

AnotherSampleException: This is another sample exception

**Custom Tag** This is a custom tag

**Another Custom Tag** This is another custom tag

---

### `public SampleEnum sampleMethodWithParams(String param1, Integer param2)`

`NAMESPACEACCESSIBLE`

This is a sample method with parameters

#### Parameters
| Name | Type | Description |
|------|------|-------------|
| param1 | String | This is the first parameter |
| param2 | Integer | This is the second parameter |

#### Returns
SampleEnum: Some return value
