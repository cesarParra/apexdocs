/**
 * @description Manages sample accounts. Returns {@code null} when an account is missing,
 *              and treats {@literal <NULL>} markers literally. Delegates most work to
 *              {@link SampleClass#sayHello()}.
 * @author John Doe
 * @author Jane Doe
 * @since 1.0.0
 * @version 2.3.0
 * @group SampleGroup
 * @see SampleClass#sayHello()
 * @see "The Salesforce Security Guide"
 * @see <a href="https://example.com/runbook">Operations Runbook</a>
 */
public with sharing class SampleAccountService {
    /**
     * @description Fetches an account by id.
     * @group Queries
     * @param accountId The id of the account. Must not be {@code null}.
     * @return The matching account, or {@code null} when none exists.
     * @author Jane Doe
     * @see SampleClass
     */
    public Account getAccount(Id accountId) {
        return null;
    }

    /**
     * @description Saves the account.
     * @group Persistence
     * @param record The account to save.
     * @deprecated Use {@link SampleAccountService#getAccount} and save through the standard API instead.
     */
    public void saveAccount(Account record) {
    }

    /**
     * {@hidden This member is for internal use only and is excluded from the docs.}
     * @description Internal cache warm-up.
     */
    public void warmCache() {
    }
}
