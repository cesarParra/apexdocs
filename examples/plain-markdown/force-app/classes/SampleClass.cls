/**
 * @description This is a sample class.
 * @group SampleGroup
 * @example
 * SampleClass sample = new SampleClass();
 * sample.doSomething();
 */
public with sharing virtual class SampleClass extends BaseClass implements SampleInterface, ParentInterface {
    private final String name;

    /**
     * @description This is a sample constructor.
     */
    public SampleClass() {}

    public SampleClass(String name) {
        this.name = name;
    }

    /**
     * @description This is a sample method.
     * @return A string value.
     */
    public virtual String sayHello() {
        return 'Hello';
    }
}
