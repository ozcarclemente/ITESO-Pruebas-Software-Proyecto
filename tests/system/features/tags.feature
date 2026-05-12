Feature: Tags
    As a user
    I want to see popular tags and filter articles by tag
    So I can find content that interests me

    Scenario: Viewing popular tags on home page
        Given I navigate to the home page
        Then I should see the "Popular Tags" sidebar
        And I should see at least one tag in the sidebar

    Scenario: Filtering articles by tag
        Given I navigate to the home page
        When I click on a tag from the sidebar
        Then the feed should filter articles by that tag
        And I should see the tag tab as active
