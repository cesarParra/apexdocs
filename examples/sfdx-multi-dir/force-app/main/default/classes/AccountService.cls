/**
 * @description Service class for handling Account operations
 * @author ApexDocs Team
 * @group Account Management
 */
public with sharing class AccountService {

    /**
     * @description Retrieves an Account record by its Id
     * @param accountId The Id of the Account to retrieve
     * @return The Account record or null if not found
     * @example
     * Account acc = AccountService.getAccountById('0011234567890123');
     */
    public static Account getAccountById(Id accountId) {
        try {
            return [SELECT Id, Name, Type, Industry FROM Account WHERE Id = :accountId LIMIT 1];
        } catch (QueryException e) {
            System.debug('Error retrieving account: ' + e.getMessage());
            return null;
        }
    }

    /**
     * @description Creates a new Account record
     * @param accountName The name for the new Account
     * @param accountType The type of Account to create
     * @return The Id of the newly created Account
     * @throws DmlException if the Account cannot be created
     */
    public static Id createAccount(String accountName, String accountType) {
        Account newAccount = new Account(
            Name = accountName,
            Type = accountType
        );

        insert newAccount;
        return newAccount.Id;
    }

    /**
     * @description Updates the industry field for multiple accounts
     * @param accountIds List of Account Ids to update
     * @param industry The industry value to set
     * @return Number of successfully updated accounts
     */
    public static Integer updateAccountIndustry(List<Id> accountIds, String industry) {
        List<Account> accountsToUpdate = [
            SELECT Id FROM Account
            WHERE Id IN :accountIds
        ];

        for (Account acc : accountsToUpdate) {
            acc.Industry = industry;
        }

        try {
            update accountsToUpdate;
            return accountsToUpdate.size();
        } catch (DmlException e) {
            System.debug('Error updating accounts: ' + e.getMessage());
            return 0;
        }
    }

    /**
     * @description Private helper method to validate account data
     * @param accountData The account data to validate
     * @return True if valid, false otherwise
     */
    private static Boolean validateAccountData(Account accountData) {
        return accountData != null &&
               String.isNotBlank(accountData.Name) &&
               accountData.Name.length() <= 255;
    }
}
