Feature: Profile Tabs
    As a logged-in user
    I want to navigate my profile article tabs
    So I can review my own articles and favorites

    Scenario: Viewing my articles tab on my profile
        Given I am logged in with profile test user credentials
        And I have created a profile article titled "Profile Tabs Article"
        When I navigate to my profile page
        Then I should see my created article in the profile articles list
        And the "My Articles" profile tab should be active

    Scenario: Viewing favorited articles tab on my profile
        Given I am logged in with profile test user credentials
        And I have favorited an article titled "Profile Tabs Favorite"
        When I navigate to my profile page
        And I switch to the "Favorited Articles" profile tab
        Then I should see my favorited article in the profile articles list
        And the "Favorited Articles" profile tab should be active
