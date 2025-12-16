/**
 * @description This is a sample class to demonstrate custom template functionality in ApexDocs.
 * It contains various elements that can be rendered using custom templates:
 * - Class-level annotations
 * - Methods with parameters and return types
 * - Properties with descriptions
 * - Inheritance
 *
 * This class provides utility methods for string manipulation and validation.
 *
 * @example
 * // Example usage:
 * MyClass instance = new MyClass();
 * String result = instance.reverseString('Hello');
 * System.debug(result); // Outputs: 'olleH'
 *
 * @author Example User
 * @since v1.0.0
 */
public with sharing class MyClass extends BaseClass {

    /**
     * @description A sample property that stores configuration settings.
     * This property can be used to customize the behavior of the class methods.
     */
    public String configSetting { get; set; }

    /**
     * @description Reverses the input string.
     * This method takes any string and returns its characters in reverse order.
     *
     * @param input The string to be reversed. Cannot be null.
     * @return The reversed string.
     * @throws IllegalArgumentException if input is null.
     *
     * @example
     * // Returns "dlroW olleH"
     * String reversed = reverseString('Hello World');
     */
    public String reverseString(String input) {
        if (input == null) {
            throw new IllegalArgumentException('Input cannot be null');
        }
        return input.reverse();
    }

    /**
     * @description Validates if the input string matches the specified pattern.
     * This method uses regular expressions to validate string formats.
     *
     * @param input The string to validate.
     * @param pattern The regular expression pattern to match against.
     * @return `true` if the input matches the pattern, `false` otherwise.
     *
     * @example
     * // Returns true
     * Boolean isValid = validatePattern('test@example.com', '[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}');
     */
    public Boolean validatePattern(String input, String pattern) {
        if (input == null || pattern == null) {
            return false;
        }
        Pattern myPattern = Pattern.compile(pattern);
        Matcher myMatcher = myPattern.matcher(input);
        return myMatcher.matches();
    }

    /**
     * @description A private helper method that performs internal calculations.
     * This method is not exposed in the public API but is used internally by other methods.
     *
     * @param value The numeric value to process.
     * @return The processed result.
     */
    private Integer calculateInternal(Integer value) {
        return value * 2 + 10;
    }
}
