/**
 * @description aliquip ex sunt officia ullamco anim deserunt magna aliquip nisi eiusmod in sit officia veniam ex
 *              **deserunt** ea officia exercitation laboris enim in duis quis enim eiusmod eu amet cupidatat.
 * @group SampleGroup
 * @example
 * SampleClass sample = new SampleClass();
 * sample.doSomething();
 * @internal This should not appear in the docs
 */
public with sharing virtual class SampleClass extends BaseClass implements SampleInterface, ParentInterface {
    // @start-group Group Name
    /**
     * @description This is a sample field.
     */
    private final String name;
    public String someProperty { get; private set; }
    // @end-group

    /**
     * @description This is a sample constructor.
     */
    public SampleClass() {}

    // @start-group Other Constructors
    public SampleClass(String name) {
        this.name = name;
    }
    // @end-group

    // @start-group Available Methods
    public void doSomething() {
        System.debug('Doing something');
    }
    // @end-group

    // @start-group Deprecated Methods

    /**
     * @description This is a sample method.
     * @return A string value.
     * @example
     * SampleClass sample = new SampleClass();
     * sample.doSomething();
     */
    @Deprecated
    public virtual String sayHello() {
        return 'Hello';
    }

    // @end-group

    public class SomeInnerClass {
        public String someInnerField;

        public void doSomething() {
            System.debug('Doing something');
        }
    }

    /**
     * @description This enum is used for foo and bar.
     */
    public enum SomeEnum {
        /** @description This is a test. */
        TEST_1,
        TEST_2,
        TEST_3
    }

    public interface SomeInterface {
        void doSomething();
    }
}
