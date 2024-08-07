masaca

# SampleException Class

This is a sample exception.

**Usage** 

You can use the exception the following way. 

You can also take a look at [SampleClass](../SampleGroup/SampleClass.md) to see how it is used. 

This is a dangerous HTML tag: &lt;script&gt;alert(&#x27;Hello&#x27;);&lt;/script&gt; 

```apex
try {
   throw new SampleException();
} catch (SampleException e) {
  System.debug('Caught exception');
}
```

**Inheritance**

Exception