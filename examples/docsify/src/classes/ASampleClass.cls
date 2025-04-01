/**
 * @description This is a class description <<SomeDto>>.
 * {{copyright}}
 * @see SomeDto
 * @see SampleInterface
 * @mermaid
 * ```mermaid
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
  * ```
 */
public class ASampleClass {
    /**
     * @description Some description
     * @param surveyType2 my value
     * @return whatever
     */
    public static Map<String, Object> getActiveSurveySettings(String surveyType2) {
        System.debug('Map based example');
    }

    public static List< String > someMethod() {
        System.debug('Some method.');
    }

    /**
     * @description Executes commands based on the passed in argument.
     */
    public static String sampleMethod(List<String> argument) {
        System.debug('Execute');
        return '';
    }

    /**
     * @description Calls the method.
     * This methods allows you to call it.
     */
    public static void call() {
    }

//    /**
//     * @description This is a String property.
//     */
//    String MyProp { get; set; }
//
//    /**
//     * @description This is a Decimal property.
//     */
//    Decimal AnotherProp { get; private set; }
}
