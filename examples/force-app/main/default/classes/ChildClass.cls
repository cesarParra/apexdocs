public class ChildClass extends ParentClass implements SampleInterface {
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

    /**
     * @description Executes the command.
     */
    public void execute();

    /**
     * @description Returns a value based on the executed command.
     * @return The value
     */
    public String getValue();
}