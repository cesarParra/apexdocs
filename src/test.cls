/**
 * @description This is my class description.
 */
public with sharing class Test {

    public JustAVar;
    public PropWithPrivSet { public; private set; }

    enum MyEnum {
        A,
        B,
        C
    }

    /**
     * @description This method does something pretty cool.
     * @example
     * Hello!
     * 
     */
    public static void testMethod() { // whatsup
        System.debug('Hello');
    }

    // This class cannot be instantiated
    private Test() { }

    /**
     * @description My property rules.
     */
    public MyProp { get; set; }

    public AnotherProp { get; private set; }

    public class InnerClass {
        public InnerProp { get; set; }
        public JustAVar;

        public void innerMethod() {
            System.debug('Hey!');
        }
    }
}