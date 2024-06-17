# ns.SampleInterface interface

Access: `public`

`NAMESPACEACCESSIBLE`

This is a sample interface

**Author** John Doe

**Date** 2020-01-01

**See** [ns.SampleEnum](../Sample-Enums/ns.SampleEnum.md)

**See** [ns.ReferencedEnum](./ns.ReferencedEnum.md)

```mermaid
graph TD
   A[SampleInterface] --&gt;|extends| B[ParentInterface]
   B --&gt;|extends| C[GrandParentInterface]
   C --&gt;|extends| D[GreatGrandParentInterface]
```

```apex
SampleInterface sampleInterface = new SampleInterface();
sampleInterface.sampleMethod();
```
**Extends**
[ns.ParentInterface](./ns.ParentInterface.md)

## Methods
### `public String sampleMethod()`

`NAMESPACEACCESSIBLE`

This is a sample method

#### Returns
**String**

Some return value

#### Throws
[ns.SampleException](./ns.SampleException.md): This is a sample exception

AnotherSampleException: This is another sample exception

**Custom Tag** This is a custom tag

**Another Custom Tag** This is another custom tag

```mermaid
graph TD
  A[SampleInterface] --&gt;|extends| B[ParentInterface]
  B --&gt;|extends| C[GrandParentInterface]
  C --&gt;|extends| D[GreatGrandParentInterface]
```

```apex
SampleInterface sampleInterface = new SampleInterface();
sampleInterface.sampleMethod();
```

---

### `public SampleEnum sampleMethodWithParams(String param1, Integer param2, SampleEnum theEnum)`

`NAMESPACEACCESSIBLE`
`DEPRECATED`

This is a sample method with parameters 

Sometimes it won&#x27;t be possible to find a NonExistent link.

#### Parameters
| Name | Type | Description |
|------|------|-------------|
| param1 | String | This is the first parameter |
| param2 | Integer | This is the second parameter |
| theEnum | [ns.SampleEnum](../Sample-Enums/ns.SampleEnum.md) | This is an enum parameter |

#### Returns
**[ns.SampleEnum](../Sample-Enums/ns.SampleEnum.md)**

Some return value

---

### `public void sampleParentMethod()`

*Inherited*

#### Returns
**void**
