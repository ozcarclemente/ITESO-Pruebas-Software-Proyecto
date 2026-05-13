Feature: Not Found Pages
    As a user
    I want to see a not found page for invalid routes
    So I understand the requested resource does not exist

    Scenario: Visiting a nonexistent article page
        When I navigate to an invalid article page
        Then I should see the not found page
        And I should see the not found home link

    Scenario: Visiting a nonexistent profile page
        When I navigate to an invalid profile page
        Then I should see the not found page
        And I should see the not found home link

    Scenario: Returning home from the not found page
        Given I am on the not found page
        When I click the not found home link
        Then I should be back on the home page from the not found page
