Feature: Home Page
  As a user
  I want to visit the home page
  So that I can see the application

  Scenario: User opens home page
    Given the application is running
    When the user navigates to the home page
    Then the page title should contain "Conduit"

  Scenario: Navigation bar is visible
    Given the application is running
    When the user navigates to the home page
    Then the navigation bar should be visible
