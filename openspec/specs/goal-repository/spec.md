# goal-repository Specification

## Purpose
TBD - created by archiving change database-schema. Update Purpose after archive.
## Requirements
### Requirement: Create goal
The system SHALL provide a `createGoal` method that inserts a new goal with user_id, type (daily/monthly/yearly), target_amount, optional category_id, start_date, and end_date.

#### Scenario: Monthly goal created
- **WHEN** `createGoal` is called with type='monthly'
- **THEN** a goal row is inserted with appropriate date range

### Requirement: Get goals by user and type
The system SHALL provide a `getGoalsByUserIdAndType` method that returns all active goals for a user filtered by period type.

#### Scenario: Get monthly goals
- **WHEN** `getGoalsByUserIdAndType` is called with type='monthly'
- **THEN** all active monthly goals are returned

### Requirement: Calculate goal progress
The system SHALL provide a `getGoalProgress` method that calculates the current progress toward a goal by aggregating relevant transactions within the goal's date range.

#### Scenario: Income goal progress
- **WHEN** `getGoalProgress` is called for an income goal
- **THEN** the total income within the goal's date range is returned as progress

#### Scenario: Expense goal progress
- **WHEN** `getGoalProgress` is called for an expense goal
- **THEN** the total expenses within the goal's date range are returned as progress

### Requirement: Delete goal
The system SHALL provide a `deleteGoal` method that removes a goal by its ID.

#### Scenario: Goal deleted
- **WHEN** `deleteGoal` is called with a valid goal ID
- **THEN** the goal is removed

