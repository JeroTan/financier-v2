## ADDED Requirements

### Requirement: Get categories by user
The system SHALL provide a `getCategoriesByUserId` method that returns all categories (default + custom) for a given user.

#### Scenario: User has default and custom categories
- **WHEN** `getCategoriesByUserId` is called
- **THEN** both default and custom categories are returned

### Requirement: Create custom category
The system SHALL provide a `createCategory` method that inserts a new custom category for a user.

#### Scenario: Custom category created
- **WHEN** `createCategory` is called with a name and user_id
- **THEN** a new category row is inserted with is_default=0

#### Scenario: Duplicate category name
- **WHEN** `createCategory` is called with a name that already exists for the user
- **THEN** an error is returned

### Requirement: Seed default categories
The system SHALL provide a `seedDefaultCategories` method that inserts default categories (Food, Transport, Shopping, Entertainment, Bills, Salary, Freelance, Investment, Other) for a new user.

#### Scenario: First-time user
- **WHEN** a user registers and has no categories
- **THEN** default categories are seeded

### Requirement: Delete custom category
The system SHALL provide a `deleteCategory` method that removes a custom category. Default categories SHALL NOT be deletable.

#### Scenario: Custom category deleted
- **WHEN** `deleteCategory` is called on a custom category
- **THEN** the category is removed

#### Scenario: Default category deletion attempt
- **WHEN** `deleteCategory` is called on a default category
- **THEN** an error is returned
