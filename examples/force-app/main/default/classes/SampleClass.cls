/**
 * @description This is a class description. This class relates to {@link SampleInterface}
 *              But this {@link ClassThatDoesNotExist} does not exist.
 *              You can also link using this syntax <<SampleInterface>>
 * @group Main
 * @CustomAnnotation A Custom annotation
 * @author Cesar Parra
 * @see SampleInterface
 */
@NamespaceAccessible
public with sharing class SampleClass {
    /**
     * @description This is a namespace accessible enum
     */
    @NamespaceAccessible
    public enum InnerEnum {
        A,
        B,
        C
    }

    // @start-group Common Constants

    public List<String> listOfStrings;

    /**
     * @description This is a constant.
     */
    @NamespaceAccessible
    public static final String A_CONSTANT = 'My Constant Value';
    public static final String ANOTHER_CONSTANT = 'My Constant Value';
    // @end-group

    // @start-group 'General' Constants
    /**
     * @description This is a constant.
     */
    @NamespaceAccessible
    public static final String GENERAL_A_CONSTANT = 'My Constant Value';
    public static final String GENERAL_ANOTHER_CONSTANT = 'My Constant Value';
    // @end-group

    // @start-group Other variables
    public String someVariable = 'test';
    // @end-group

    // @start-group My Super Group
    /**
     * @description Constructs a SampleClass without any arguments. This relates to {@link SampleInterface}
     * @throws ExcName some exception
     * @CustomAnnotation A Custom method annotation
     * @see SampleInterface
     * @example
     * // Example
     * SampleClass sampleInstance = new SampleClass();
     */
    @NamespaceAccessible
    public SampleClass() {
        System.debug('Constructor');
    }
    // @end-group

    /**
     * @description Constructs a SampleClass with an argument.
     * @param argument1 Argument1 definition
     * @param argument2 Argument2 definition
     */
    public SampleClass(String argument1, String argument2) {
        System.debug('Constructor');
    }


    // @start-group A method group
    /**
     * @description Executes commands based on the passed in argument.
     * @example
     * String result = SampleClass.testMethod();
     * System.debug(result);
     * @param argument1 Argument1 to debug
     * @param argument2 Argument2 to debug
     * @return Empty string
     */
    @NamespaceAccessible
    public static String sampleMethod(String argument1, String argument2) {
        System.debug('Execute');
        return '';
    }

    /**
     * @description Something here
     * @arg1 The arg1 description
     */
    public static String anotherSampleMethod(String arg1) {
        System.debug('something');
        return '';
    }

    public static Map<Id, List<String>> yetAnotherSampleMethod(String arg1) {
        System.debug('something');
        return new Map<Id, List<String>>();
    }
    // @end-group


    /**
     * @description Calls the method.
     * This methods allows you to call it.
     */
    public static void call() {
    }

    /**
     * @description This is a String property.
     */
    @AuraEnabled
    @Deprecated
    public String MyProp { get; set; }

    /**
     * @description This is a Decimal property.
     */
    @AuraEnabled
    public Decimal AnotherProp { get; private set; }

    private String somePrivateStuff;

    /**
     * @description Inner class belonging to SampleClass.
     */
    public class InnerClass {
        /**
         * @description Description of the inner property.
         */
        public String InnerProp {
            get;
            set;
        }

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
            get;
            set;
        }

        /**
         * @description Executes from the inner class.
         */
        public void innerMethod() {
            System.debug('Executing inner method.');
        }
    }
}
