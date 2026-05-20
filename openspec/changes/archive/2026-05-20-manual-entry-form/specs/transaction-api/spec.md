## ADDED Requirements

### Requirement: Create transaction endpoint
The system SHALL provide a `POST /api/transactions` endpoint that accepts a transaction payload and saves it to D1.

#### Scenario: Transaction created
- **WHEN** a valid transaction payload is POSTed
- **THEN** the transaction is saved to D1 and returned with its ID

#### Scenario: Invalid payload
- **WHEN** an invalid payload is POSTed
- **THEN** a 400 VALIDATION error is returned with field-level error details

### Requirement: Transaction payload schema
The system SHALL validate the request body against a Zod schema requiring: type (income|expense), amount (positive number), date (ISO 8601), and optional: category_id, description, receipt_url.

#### Scenario: Valid payload
- **WHEN** the payload contains all required fields with valid values
- **THEN** the request proceeds to save

#### Scenario: Missing required field
- **WHEN** the payload is missing the amount field
- **THEN** a validation error for the amount field is returned

### Requirement: Authenticated access
The system SHALL require a valid JWT token to access the transaction creation endpoint.

#### Scenario: Unauthenticated request
- **WHEN** a request is made without a valid JWT
- **THEN** an AUTH_REQUIRED error is returned
