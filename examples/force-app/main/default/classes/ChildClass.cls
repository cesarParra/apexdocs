public class ChildClass extends ParentClass {
    public void doSomething() {
        System.debug('Do something');
    }

    /**
     * @description This method was overridden.
     * @return A String.
     */
    public override String overridableMethodOverridden() {
        return '';
    }
}