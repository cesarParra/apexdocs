/**
 * @description Helper class for Lightning Web Components
 * @author ApexDocs Team
 * @group Lightning Web Components
 */
public with sharing class LWCHelper {

    /**
     * @description Retrieves picklist values for a given object and field
     * @param objectApiName The API name of the object
     * @param fieldApiName The API name of the field
     * @return List of picklist entries with label and value
     * @example
     * List<PicklistEntry> entries = LWCHelper.getPicklistValues('Account', 'Industry');
     */
    @AuraEnabled(cacheable=true)
    public static List<PicklistEntry> getPicklistValues(String objectApiName, String fieldApiName) {
        List<PicklistEntry> picklistEntries = new List<PicklistEntry>();

        try {
            Schema.SObjectType objectType = Schema.getGlobalDescribe().get(objectApiName);
            Schema.DescribeSObjectResult objectDescribe = objectType.getDescribe();
            Schema.DescribeFieldResult fieldDescribe = objectDescribe.fields.getMap().get(fieldApiName).getDescribe();

            for (Schema.PicklistEntry entry : fieldDescribe.getPicklistValues()) {
                if (entry.isActive()) {
                    picklistEntries.add(new PicklistEntry(entry.getLabel(), entry.getValue()));
                }
            }
        } catch (Exception e) {
            System.debug('Error retrieving picklist values: ' + e.getMessage());
        }

        return picklistEntries;
    }

    /**
     * @description Retrieves current user information for LWC components
     * @return UserInfo object containing user details
     */
    @AuraEnabled(cacheable=true)
    public static UserInfo getCurrentUserInfo() {
        return new UserInfo(
            UserInfo.getUserId(),
            UserInfo.getName(),
            UserInfo.getUserEmail(),
            UserInfo.getProfileId()
        );
    }

    /**
     * @description Validates user permissions for a specific object and operation
     * @param objectApiName The API name of the object
     * @param operation The operation to check ('create', 'read', 'update', 'delete')
     * @return True if user has permission, false otherwise
     */
    @AuraEnabled(cacheable=true)
    public static Boolean checkUserPermission(String objectApiName, String operation) {
        try {
            Schema.SObjectType objectType = Schema.getGlobalDescribe().get(objectApiName);
            Schema.DescribeSObjectResult objectDescribe = objectType.getDescribe();

            switch on operation.toLowerCase() {
                when 'create' {
                    return objectDescribe.isCreateable();
                }
                when 'read' {
                    return objectDescribe.isAccessible();
                }
                when 'update' {
                    return objectDescribe.isUpdateable();
                }
                when 'delete' {
                    return objectDescribe.isDeletable();
                }
                when else {
                    return false;
                }
            }
        } catch (Exception e) {
            System.debug('Error checking user permissions: ' + e.getMessage());
            return false;
        }
    }

    /**
     * @description Inner class to represent picklist entries
     */
    public class PicklistEntry {
        @AuraEnabled public String label { get; set; }
        @AuraEnabled public String value { get; set; }

        public PicklistEntry(String label, String value) {
            this.label = label;
            this.value = value;
        }
    }

    /**
     * @description Inner class to represent user information
     */
    public class UserInfo {
        @AuraEnabled public Id userId { get; set; }
        @AuraEnabled public String userName { get; set; }
        @AuraEnabled public String userEmail { get; set; }
        @AuraEnabled public Id profileId { get; set; }

        public UserInfo(Id userId, String userName, String userEmail, Id profileId) {
            this.userId = userId;
            this.userName = userName;
            this.userEmail = userEmail;
            this.profileId = profileId;
        }
    }
}
