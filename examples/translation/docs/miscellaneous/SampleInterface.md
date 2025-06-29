# SampleInterface Interfaz

`NAMESPACEACCESSIBLE`

This is a sample interface

**Mermaid** 

graph TD 
A[SampleInterface] --&gt;|extends| B[ParentInterface] 
B --&gt;|extends| C[GrandParentInterface] 
C --&gt;|extends| D[GreatGrandParentInterface]

**Autor** John Doe

**Date** 2020-01-01

**See** [SampleEnum](../sample-enums/SampleEnum.md)

**See** [ReferencedEnum](ReferencedEnum.md)

## Example
SampleInterface sampleInterface &#x3D; new SampleInterface(); 
sampleInterface.sampleMethod();

**Extends**
[ParentInterface](ParentInterface.md)

## Métodos
### `sampleMethod()`

`NAMESPACEACCESSIBLE`

This is a sample method

**Custom Tag** 

This is a custom tag

**Another Custom Tag** 

This is another custom tag

**Mermaid** 

graph TD 
A[SampleInterface] --&gt;|extends| B[ParentInterface] 
B --&gt;|extends| C[GrandParentInterface] 
C --&gt;|extends| D[GreatGrandParentInterface]

#### Firma
```apex
public String sampleMethod()
```

#### Tipo de Retorno
**String**

Some return value

#### Lanza
[SampleException](SampleException.md): This is a sample exception

AnotherSampleException: This is another sample exception

#### Example
SampleInterface sampleInterface &#x3D; new SampleInterface(); 
sampleInterface.sampleMethod();

---

### `sampleMethodWithParams(param1, param2, theEnum)`

`NAMESPACEACCESSIBLE`
`DEPRECATED`

This is a sample method with parameters 
Sometimes it won&#x27;t be possible to find a NonExistent link.

#### Firma
```apex
public SampleEnum sampleMethodWithParams(String param1, Integer param2, SampleEnum theEnum)
```

#### Parámetros
| Name | Type | Description |
|------|------|-------------|
| param1 | String | This is the first parameter |
| param2 | Integer | This is the second parameter |
| theEnum | [SampleEnum](../sample-enums/SampleEnum.md) | This is an enum parameter |

#### Tipo de Retorno
**[SampleEnum](../sample-enums/SampleEnum.md)**

Some return value

---

### `sampleParentMethod()`

*Inherited*

#### Firma
```apex
public void sampleParentMethod()
```

#### Tipo de Retorno
**void**