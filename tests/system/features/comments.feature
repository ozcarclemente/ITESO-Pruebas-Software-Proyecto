Feature: Article Comments
  As a logged-in user
  I want to add and remove comments on articles
  So I can participate in discussions

  Background:
    Given I am logged in with test user credentials
    And I navigate to article "lorem-ipsum-1"

  Scenario: User adds a comment and sees it in the list
    When I write a comment "This is a test comment"
    And I submit the comment
    Then I should see "This is a test comment" in the comments list

  Scenario: User deletes their own comment
    Given I have posted a comment "Comment to be deleted"
    When I delete that comment
    Then the comment "Comment to be deleted" should not appear in the list
