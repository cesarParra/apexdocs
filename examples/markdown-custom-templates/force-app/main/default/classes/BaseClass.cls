/**
 * @description Base class providing common functionality for derived classes.
 * This class demonstrates inheritance features that can be captured in custom templates.
 * It includes protected methods and properties that inherited classes can use.
 * This is a link to {@link MyClass} and this is a link to something that does not exist {@link NonExistentClass}.
 *
 * @author Example User
 * @since v1.0.0
 */
public virtual with sharing class BaseClass {

    /**
     * @description A protected property that stores the instance creation timestamp.
     * Inherited classes can access and modify this property.
     */
    protected DateTime createdTimestamp { get; set; }

    /**
     * @description Constructor that initializes the base class.
     * Sets the creation timestamp to the current time.
     */
    public BaseClass() {
        this.createdTimestamp = DateTime.now();
    }

    /**
     * @description Gets the age of this instance in seconds.
     * This method calculates how many seconds have passed since the instance was created.
     *
     * @return The age in seconds as a Long value.
     *
     * @example
     * // Returns the number of seconds since the instance was created
     * Long age = getInstanceAge();
     */
    public virtual Long getInstanceAge() {
        if (createdTimestamp == null) {
            return 0;
        }
        return (DateTime.now().getTime() - createdTimestamp.getTime()) / 1000;
    }

    /**
     * @description A protected helper method that formats a message with a prefix.
     * This method is only accessible to classes that extend BaseClass.
     *
     * @param message The message to format.
     * @return The formatted message with a prefix.
     */
    protected String formatMessage(String message) {
        if (message == null) {
            return '[BaseClass]: null';
        }
        return '[BaseClass]: ' + message;
    }

    /**
     * @description Virtual method that can be overridden by derived classes.
     * Provides a default implementation that returns a simple greeting.
     *
     * @return A greeting message.
     */
    public virtual String getGreeting() {
        return 'Hello from BaseClass';
    }

    /**
     * @description Abstract method that must be implemented by derived classes.
     * This demonstrates how abstract methods appear in documentation.
     * Derived classes must provide their own implementation.
     *
     * @return A string representing the class identifier.
     */
    public virtual String getIdentifier() {
        return 'BaseClass';
    }
}
