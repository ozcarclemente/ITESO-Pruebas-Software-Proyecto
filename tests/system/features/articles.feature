Feature: Article CRUD
    As a user
    I want to create, edit and delete articles
    So I can manage my own content in the app

    Background:
        Given I am logged in with exampleUser1 credentials

    Scenario: User creates a new article successfully
        Given I navigate to the new article page
        When I input "Test Article" in the article title
        And I input "This is a test article." in the article description
        And I input "Lorem ipsum dolor sit amet." in the article body
        And I publish the article
        Then I should be redirected to the article page
        And I should see "Test Article" as the article title

    Scenario: User edits an existing article
        Given I navigate to the new article page
        When I input "Edit Me" in the article title
        And I input "TBA" in the article description
        And I input "TBA" in the article body
        And I publish the article
        When I click the Edit Article button
        And I update the article title with "Edited Article"
        And I update the article description with "This is an edited article."
        And I update the article body with "Hello World!"
        And I submit the article update
        Then I should be redirected to the article page
        And I should see "Edited Article" as the article title

    Scenario: User deletes an article
        Given I navigate to the new article page
        When I input "Delete Me" in the article title
        And I input "This article will be deleted." in the article description
        And I input "Bye bye!" in the article body
        And I publish the article
        When I click the Delete Article button and confirm
        Then I should be redirected to the home page
        And the article "Delete Me" should not appear in the feed
