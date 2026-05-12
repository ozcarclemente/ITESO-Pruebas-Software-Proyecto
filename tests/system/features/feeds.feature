Feature: Feeds and Pagination
    As a user
    I want to navigate between Global Feed and Your Feed
    And view paginated article lists
    So I can discover and follow articles efficiently

    Background:
        Given I have seeded articles with 10 total and follows configured

    Scenario: User views Global Feed on home page
        Given I navigate to feeds home page
        When I view the feed section
        Then I should see articles in the feed
        And I should see pagination controls

    Scenario: User views Global Feed with pagination
        Given I navigate to feeds home page
        When I view the feed section
        Then I should see a limited number of articles on the first page
        When I click the next page button
        Then the articles shown should be different from the previous page

    Scenario: User switches to Your Feed when logged in
        Given I am authenticated as exampleUser5
        When I navigate to feeds home page
        Then I should see Your Feed is active
        And I should see articles from followed authors

    Scenario: Logged-in user views feed with pagination
        Given I am authenticated as exampleUser5
        When I navigate to feeds home page
        Then I should see Your Feed is active
        And I should see articles in the feed
        When I click the next page button
        Then the article list should update with new articles

    Scenario: Pagination respects limit and offset
        Given I navigate to feeds home page
        When I view the feed section
        Then articles should load with default limit (10 articles)
        When I click the next page button
        Then next page should show articles with correct offset
