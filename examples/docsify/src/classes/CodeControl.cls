public with sharing class CodeControl {

    // @start-group Picklist constant for Code_Control__mdt.Logging__c
    public static final String LOGGING_CONTROL_NONE = 'None';
    public static final String LOGGING_CONTROL_DEBUG = 'Debug';
    public static final String LOGGING_CONTROL_ERROR = 'Error';
    // @end-group

    // @start-group Picklist constants for Code_Control__mdt.Enabled__c
    public static final String TRIGGER_CONTROL_ENABLED = 'Yes';
    public static final String TRIGGER_CONTROL_DISABLED = 'No';
    public static final String FEATURE_CONTROL_ENABLED = 'Yes';
    public static final String FEATURE_CONTROL_DISABLED = 'No';
    // @end-group

    /* Special MDT values */
    public static final String WILDCARD_SOURCE = 'CodeControl_Default';
    public static final String SYSTEM_WIDE_SOURCE = 'CodeControl_Override';
}
