# SampleClass Clase
`virtual`

aliquip ex sunt officia ullamco anim deserunt magna aliquip nisi eiusmod in sit officia veniam ex 
**deserunt** ea officia exercitation laboris enim in duis quis enim eiusmod eu amet cupidatat.

**Internal** 

This should not appear in the docs

**Group** SampleGroup

**See** [Event__c](../custom-objects/Event__c.md)

## Example
SampleClass sample &#x3D; new SampleClass(); 
sample.doSomething();

**Herencia**

[BaseClass](../miscellaneous/BaseClass.md)

**Implementa**

[SampleInterface](../miscellaneous/SampleInterface.md), 
[ParentInterface](../miscellaneous/ParentInterface.md)

## Campos
### `sampleEnumFromBase`

*Inherited*

#### Firma
```apex
public sampleEnumFromBase
```

#### Tipo
[SampleEnum](../sample-enums/SampleEnum.md)

## Propiedades
### Group Name
#### `someProperty`

##### Firma
```apex
public someProperty
```

##### Tipo
String

## Constructores
### Other
#### `SampleClass()`

This is a sample constructor.

##### Firma
```apex
public SampleClass()
```

### Other Constructors
#### `SampleClass(name)`

##### Firma
```apex
public SampleClass(String name)
```

##### Parámetros
| Name | Type | Description |
|------|------|-------------|
| name | String |  |

## Métodos
### Available Methods
#### `doSomething()`

##### Firma
```apex
public void doSomething()
```

##### Tipo de Retorno
**void**

### Deprecated Methods
#### `sayHello()`

`DEPRECATED`

This is a sample method.

##### Firma
```apex
public virtual String sayHello()
```

##### Tipo de Retorno
**String**

A string value.

##### Example
SampleClass sample &#x3D; new SampleClass(); 
sample.doSomething();

## Classes
### SomeInnerClass Clase

#### Campos
##### `someInnerField`

###### Firma
```apex
public someInnerField
```

###### Tipo
String

#### Métodos
##### `doSomething()`

###### Firma
```apex
public void doSomething()
```

###### Tipo de Retorno
**void**

## Enums
### SomeEnum Enum

This enum is used for foo and bar.

#### Valores
| Value | Description |
|-------|-------------|
| TEST_1 | This is a test. |
| TEST_2 |  |
| TEST_3 |  |

## Interfaces
### SomeInterface Interfaz

#### Métodos
##### `doSomething()`

###### Firma
```apex
public void doSomething()
```

###### Tipo de Retorno
**void**