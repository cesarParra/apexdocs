/**
 * @description This is a class description.
 * @group Sample Classes
 * @see SampleInterface
 * @see SampleClass
 */
@NamespaceAccessible
public with sharing class SampleClass2 {
    /**
     * @description Constructs a SampleClass2 without any arguments.
     * @example
     * <pre>
     * SampleClass2 sampleInstance = new SampleClass2();
     */
    @NamespaceAccessible
    public SampleClass2() {
        System.debug('Constructor');
    }

    /**
     * @description Constructs a SampleClass2 with an argument.
     * @param argument Some argument
     */
    public SampleClass2(String argument) {
        System.debug('Constructor');
    }

    /**
     * @description Executes commands based on the passed in argument.
     * @example
     * <pre>
     * String result = SampleClass2.testMethod();
     * System.debug(result);
     */
    @NamespaceAccessible
    public static String testMethod(String argument) {
        System.debug('Execute');
        return '';
    }


    /**
     * @description Calls the method.
     * This methods allows you to call it.
     */
    public static void call() {
    }

    /**
     * @description This is a String property.
     */
    public String MyProp { get; set; }

    /**
     * @description This is a Decimal property.
     */
    public Decimal AnotherProp { get; private set; }

    /**
     * @description Inner class belonging to SampleClass2.
     */
    public class InnerClass {
        /**
         * @description Description of the inner property.
         */
        public InnerProp {
            get; set;
        }

        /**
         * @description Executes from the inner class.
         */
        public void innerMethod() {
            System.debug('Executing inner method.');
        }
    }

    /**
     * @description Inner class belonging to SampleClass2.
     */
    public class AnotherInnerClass {
        /**
         * @description Description of the inner property.
         */
        public InnerProp {
            get; set;
        }

        /**
         * @description Executes from the inner class.
         */
        public void innerMethod() {
            System.debug('Executing inner method.');
        }
    }
}
