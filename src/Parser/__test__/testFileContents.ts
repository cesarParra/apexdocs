export const contents =
  '/ \n' +
  '* @description Constructs a SampleClass without any arguments.\n' +
  '* @example\n' +
  '* <pre>\n' +
  '* SampleClass sampleInstance = new SampleClass();\n' +
  '*/\n' +
  'public SampleClass() {\n' +
  "   System.debug('Constructor');\n" +
  '}\n' +
  '\n' +
  '/**\n' +
  '* @description Constructs a SampleClass with an argument.\n' +
  '*/\n' +
  'public SampleClass(String argument) {\n' +
  "   System.debug('Constructor');\n" +
  '}\n' +
  '\n' +
  '/**\n' +
  '* @description Executes commands based on the passed in argument.\n' +
  '* @example\n' +
  '* <pre>\n' +
  '* String result = SampleClass.testMethod();\n' +
  '* System.debug(result);\n' +
  '*/\n' +
  'public static String testMethod(String argument) {\n' +
  "   System.debug('Execute');\n" +
  '   return;\n' +
  '}\n' +
  '\n' +
  '\n' +
  '/**\n' +
  '* @description Calls the method.\n' +
  '* This methods allows you to call it.\n' +
  '*/\n' +
  'public static void call() { }\n' +
  '\n' +
  '/**\n' +
  '* @description This is a String property.\n' +
  '*/\n' +
  'public String MyProp { get; set; }\n' +
  '\n' +
  '/**\n' +
  '* @description This is a Decimal property.\n' +
  '*/\n' +
  'public Decimal AnotherProp { get; private set; }\n' +
  '\n' +
  '/**\n' +
  '* @description Inner class belonging to SampleClass.\n' +
  '*/\n' +
  'public class InnerClass {\n' +
  '   /**\n' +
  '    * @description Description of the inner property.\n' +
  '    */\n' +
  '   public InnerProp { get; set; }\n' +
  '\n' +
  '   /**\n' +
  '    * @description Executes from the inner class.\n' +
  '    */\n' +
  '   public void innerMethod() {\n' +
  "       System.debug('Executing inner method.');\n" +
  '   }\n' +
  '}\n' +
  '\n' +
  '/**\n' +
  '* @description Inner class belonging to SampleClass.\n' +
  '*/\n' +
  'public class AnotherInnerClass {\n' +
  '   /**\n' +
  '    * @description Description of the inner property.\n' +
  '    */\n' +
  '   public InnerProp { get; set; }\n' +
  '\n' +
  '   /**\n' +
  '    * @description Executes from the inner class.\n' +
  '    */\n' +
  '   public void innerMethod() {\n' +
  "       System.debug('Executing inner method.');\n" +
  '   }\n' +
  '}\n' +
  '}';
