## ADDED Requirements

### Requirement: Create transaction
The system SHALL provide a `createTransaction` repository method that inserts a new transaction record with user_id, type, amount, category_id, description, date, and optional receipt_url.

#### Scenario: Successful creation
- **WHEN** `createTransaction` is called with valid data
- **THEN** a new row is inserted and the created transaction is returned

#### Scenario: Invalid type
- **WHEN** `createTransaction` is called with type other than 'income' or 'expense'
- **THEN** the database constraint rejects the insert

### Requirement: Get transactions with filtering
The system SHALL provide a `getTransactions` repository method that supports filtering by date range, type, category, and pagination (limit, offset).

#### Scenario: Filter by date range
- **WHEN** `getTransactions` is called with a date range
- **THEN** only transactions within that range are returned

#### Scenario: Filter by type
- **WHEN** `getTransactions` is called with type='expense'
- **THEN** only expense transactions are returned

#### Scenario: Pagination
- **WHEN** `getTransactions` is called with limit=10, offset=20
- **THEN** 10 transactions starting from the 21st are returned

### Requirement: Aggregate transactions
The system SHALL provide an `aggregateTransactions` method that returns total income, total expenses, and net for a given date range.

#### Scenario: Monthly aggregation
- **WHEN** `aggregateTransactions` is called for a month
- **THEN** total income, total expenses, and net are returned

### Requirement: Get transaction by ID
The system SHALL provide a `getTransactionById` method that returns a single transaction by its ID.

#### Scenario: Transaction found
- **WHEN** `getTransactionById` is called with a valid ID
- **THEN** the transaction is returned

#### Scenario: Transaction not found
- **WHEN** `getTransactionById` is called with a non-existent ID
- **THEN** null is returned
