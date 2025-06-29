# MultiInheritanceClass Clase

**Herencia**

[SampleClass](../samplegroup/SampleClass.md) < [BaseClass](BaseClass.md)

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

*Inherited*

##### Firma
```apex
public someProperty
```

##### Tipo
String

## Métodos
### Available Methods
#### `doSomething()`

*Inherited*

##### Firma
```apex
public void doSomething()
```

##### Tipo de Retorno
**void**

### Deprecated Methods
#### `sayHello()`

*Inherited*

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