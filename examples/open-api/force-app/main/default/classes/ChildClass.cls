/**
 * @description Some desc
 * @group Classes
 */
public class ChildClass extends ParentClass implements SampleInterface {
    private String privateStringFromChild;
    private String aPrivateString;

    public void doSomething() {
        System.debug('Do something');
    }

    /**
     * @description This method was overridden.
     * @return A String.
     * @mermaid
     * sequenceDiagram
     *     participant dotcom
     *     participant iframe
     *     participant viewscreen
     *     dotcom->>iframe: loads html w/ iframe url
     *     iframe->>viewscreen: request template
     *     viewscreen->>iframe: html & javascript
     *     iframe->>dotcom: iframe ready
     *     dotcom->>iframe: set mermaid data on iframe
     *     iframe->>iframe: render mermaid
     */
    public override String overridableMethodOverridden() {
        return null ?? '';
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
