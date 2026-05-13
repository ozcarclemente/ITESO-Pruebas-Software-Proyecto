Feature: Profile and Followers
    As a user
    I want to view profiles and follow other users
    So I can interact with authors on the platform

    Scenario: Viewing another user's profile while logged in
        Given I am logged in with profile test user credentials
        When I navigate to the profile page of "exampleUser2"
        Then I should see the profile username "exampleUser2"
        And I should see a profile follow button

    Scenario: Viewing my own profile
        Given I am logged in with profile test user credentials
        When I navigate to my profile page
        Then I should see the profile username "exampleUser1"
        And I should see the edit profile settings button
        And I should not see a profile follow button

    Scenario: Following another user from profile page
        Given I am logged in with profile test user credentials
        And I navigate to the profile page of "exampleUser2"
        When I follow that user from the profile page
        Then I should see the unfollow button for that profile

    Scenario: Unfollowing another user from profile page
        Given I am logged in with profile test user credentials
        And I navigate to the profile page of "exampleUser2"
        When I unfollow that user from the profile page
        Then I should see the follow button for that profile

    Scenario: Guest user cannot follow a profile
        Given I navigate to the profile page of "exampleUser2"
        When I try to follow that user as a guest
        Then the guest follow attempt should show an alert "You need to login first"
