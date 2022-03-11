/**
 * @description This is a class description.
 * @author John Doe
 * @date 1/1/2021
 * @author Jane Doe
 * @date 2/2/2022
 * @group Sample Classes
 * @see SampleInterface
 * @see SampleClass2
 */
@NamespaceAccessible
public with sharing class SampleClassMultipleAuthorsAndDates {
    /**
     * @description Constructs a SampleClassMultipleAuthorsAndDates without any arguments.
     * @example
     * <pre>
     * SampleClassMultipleAuthorsAndDates sampleInstance = new SampleClassMultipleAuthorsAndDates();
     */
    @NamespaceAccessible
    public SampleClassMultipleAuthorsAndDates() {
        System.debug('Constructor');
    }

    /**
     * @description Constructs a SampleClassMultipleAuthorsAndDates with an argument.
     * @param argument Some argument
     */
    public SampleClassMultipleAuthorsAndDates(String argument) {
        System.debug('Constructor');
    }

    /**
     * @description Executes commands based on the passed in argument.
     * @example
     * <pre>
     * String result = SampleClassMultipleAuthorsAndDates.testMethod();
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
     * @description Inner class belonging to SampleClassMultipleAuthorsAndDates.
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
     * @description Inner class belonging to SampleClassMultipleAuthorsAndDates.
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
