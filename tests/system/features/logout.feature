Feature: Logout
    As an authenticated user
    I want to log out from the navigation menu
    So I can end my session safely

    Scenario: Logging out from the user dropdown menu
        Given I am logged in for navigation tests
        When I open the user dropdown menu
        And I click the logout dropdown item
        Then I should see the guest navigation links
        And I should not see the authenticated navigation links
        And my session should be removed from local storage
