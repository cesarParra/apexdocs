/**
 * @description This is a class description.
 * @group Sample Classes
 * @see SampleInterface
 */
@NamespaceAccessible
public with sharing class SampleClass {
    /**
     * @description Constructs a SampleClass without any arguments.
     * @example
     * ```apex
     * SampleClass sampleInstance = new SampleClass();
     * ```
     */
    @NamespaceAccessible
    public SampleClass() {
        System.debug('Constructor');
    }

    /**
     * @description Constructs a SampleClass with an argument.
     * @param argument Some argument
     */
    public SampleClass(String argument) {
        System.debug('Constructor');
    }

    /**
     * @description Executes commands based on the passed in argument.
     * @example
     * ```apex
     * String result = SampleClass.testMethod();
     * System.debug(result);
     * ```
     */
    @NamespaceAccessible
    public static String someTestMethod(String argument) {
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
     * @description Inner class belonging to SampleClass.
     */
    public class InnerClass {
        /**
         * @description Description of the inner property.
         */
        public String InnerProp {get; set;}

        /**
         * @description Executes from the inner class.
         */
        public void innerMethod() {
            System.debug('Executing inner method.');
        }
    }

    /**
     * @description Inner class belonging to SampleClass.
     */
    public class AnotherInnerClass {
        /**
         * @description Description of the inner property.
         */
        public String InnerProp {
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
