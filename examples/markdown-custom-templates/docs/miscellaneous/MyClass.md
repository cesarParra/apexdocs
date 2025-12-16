---
title: MyClass
type: class
generated: '2025-12-16T22:04:50.004Z'
template: custom
---

# MyClass

## Class Information

- **Type:** Class
- **Access Modifier:** public
- **Extends:** BaseClass
- **File:** force-app/main/default/classes/MyClass.cls

## Description

This is a sample class to demonstrate custom template functionality in ApexDocs. 
It contains various elements that can be rendered using custom templates: 
- Class-level annotations 
- Methods with parameters and return types 
- Properties with descriptions 
- Inheritance 
 
This class provides utility methods for string manipulation and validation.

## Properties

### configSetting

A sample property that stores configuration settings. 
This property can be used to customize the behavior of the class methods.

- **Type:** String

### createdTimestamp

A protected property that stores the instance creation timestamp. 
Inherited classes can access and modify this property.

- **Type:** DateTime
- **Access:** protected

## Methods

### calculateInternal(value)

A private helper method that performs internal calculations. 
This method is not exposed in the public API but is used internally by other methods.

#### Parameters

- `value` (Integer): The numeric value to process.

#### Returns

- **Type:** Integer
- **Description:** The processed result.

---

### formatMessage(message)

A protected helper method that formats a message with a prefix. 
This method is only accessible to classes that extend BaseClass.

#### Parameters

- `message` (String): The message to format.

#### Returns

- **Type:** String
- **Description:** The formatted message with a prefix.

---

### getGreeting()

Virtual method that can be overridden by derived classes. 
Provides a default implementation that returns a simple greeting.

#### Returns

- **Type:** String
- **Description:** A greeting message.

---

### getIdentifier()

Abstract method that must be implemented by derived classes. 
This demonstrates how abstract methods appear in documentation. 
Derived classes must provide their own implementation.

#### Returns

- **Type:** String
- **Description:** A string representing the class identifier.

---

### getInstanceAge()

Gets the age of this instance in seconds. 
This method calculates how many seconds have passed since the instance was created.

#### Returns

- **Type:** Long
- **Description:** The age in seconds as a Long value.

---

### reverseString(input)

Reverses the input string. 
This method takes any string and returns its characters in reverse order.

#### Parameters

- `input` (String): The string to be reversed. Cannot be null.

#### Returns

- **Type:** String
- **Description:** The reversed string.

---

### validatePattern(input, pattern)

#### Parameters

- `input` (String)
- `pattern` (String)

#### Returns

- **Type:** Boolean

---

## Examples

// Example usage: 
MyClass instance = new MyClass(); 
String result = instance.reverseString(&#039;Hello&#039;); 
System.debug(result); // Outputs: &#039;olleH&#039;