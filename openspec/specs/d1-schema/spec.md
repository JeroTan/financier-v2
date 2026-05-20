# d1-schema Specification

## Purpose
TBD - created by archiving change database-schema. Update Purpose after archive.
## Requirements
### Requirement: Users table
The system SHALL have a `users` table with columns: `id` (TEXT, primary key), `email` (TEXT, unique), `password_hash` (TEXT, nullable for OAuth-only users), `google_id` (TEXT, unique, nullable), `created_at` (TEXT), `updated_at` (TEXT).

#### Scenario: User creation
- **WHEN** a new user registers via email/password
- **THEN** a row is inserted into the `users` table with email and password_hash

#### Scenario: OAuth user creation
- **WHEN** a new user registers via Google OAuth
- **THEN** a row is inserted with google_id and null password_hash

### Requirement: Transactions table
The system SHALL have a `transactions` table with columns: `id` (TEXT, primary key), `user_id` (TEXT, foreign key to users), `type` (TEXT, CHECK 'income' or 'expense'), `amount` (REAL), `currency` (TEXT, default 'PHP'), `category_id` (TEXT, foreign key to categories, nullable), `description` (TEXT, nullable), `date` (TEXT, ISO 8601), `receipt_url` (TEXT, nullable), `created_at` (TEXT), `updated_at` (TEXT).

#### Scenario: Expense transaction
- **WHEN** an expense is saved
- **THEN** a row is inserted with type='expense' and positive amount

#### Scenario: Income transaction
- **WHEN** income is saved
- **THEN** a row is inserted with type='income' and positive amount

### Requirement: Categories table
The system SHALL have a `categories` table with columns: `id` (TEXT, primary key), `user_id` (TEXT, foreign key to users), `name` (TEXT), `icon` (TEXT, nullable), `is_default` (INTEGER, default 0), `created_at` (TEXT).

#### Scenario: Default category
- **WHEN** a default category is seeded
- **THEN** a row is inserted with is_default=1

#### Scenario: Custom category
- **WHEN** a user creates a custom category
- **THEN** a row is inserted with their user_id and is_default=0

### Requirement: Goals table
The system SHALL have a `goals` table with columns: `id` (TEXT, primary key), `user_id` (TEXT, foreign key to users), `type` (TEXT, CHECK 'daily', 'monthly', or 'yearly'), `target_amount` (REAL), `category_id` (TEXT, foreign key to categories, nullable), `start_date` (TEXT), `end_date` (TEXT), `created_at` (TEXT).

#### Scenario: Monthly goal creation
- **WHEN** a user creates a monthly goal
- **THEN** a row is inserted with type='monthly' and appropriate date range

### Requirement: Indexes
The system SHALL create indexes on:
- `transactions(user_id, date)` for date-range queries
- `transactions(user_id, type)` for income/expense filtering
- `transactions(user_id, category_id)` for category filtering
- `categories(user_id)` for user category lookup
- `goals(user_id, type)` for goal lookup by period

#### Scenario: Date range query performance
- **WHEN** querying transactions for a user within a date range
- **THEN** the query uses the `idx_transactions_user_date` index

