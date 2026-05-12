Feature: Favorites
    As a logged-in user
    I want to favorite and unfavorite articles
    So I can save articles I like

    Background:
        Given I am logged in with exampleUser1 credentials for favorites

    Scenario: Favoriting an article
        Given I navigate to the home page for favorites
        When I click the favorite button on an article
        Then the favorite button should be active
        And the favorites count should increase

    Scenario: Unfavoriting an article
        Given I navigate to the home page for favorites
        When I click the favorite button on an article
        Then the favorite button should be inactive
        And the favorites count should decrease

    Scenario: Guest user cannot favorite
        Given I am not logged in
        And I navigate to the home page for favorites
        When I click the favorite button on an article
        Then I should see an alert "You need to login first"
