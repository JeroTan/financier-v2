## ADDED Requirements

### Requirement: Image attachment
The system SHALL allow users to attach an optional image to a manual transaction entry with a preview.

#### Scenario: Image selected
- **WHEN** the user selects an image file
- **THEN** a preview is displayed next to the form

#### Scenario: Image removed
- **WHEN** the user clicks remove on the image preview
- **THEN** the image is cleared from the form

### Requirement: Image file validation
The system SHALL accept only image file types (JPEG, PNG, WebP) with a maximum size of 10MB.

#### Scenario: Valid image
- **WHEN** a JPEG image under 10MB is selected
- **THEN** the image is accepted and previewed

#### Scenario: Invalid file type
- **WHEN** a non-image file is selected
- **THEN** an error message is displayed and the file is rejected

#### Scenario: File too large
- **WHEN** an image over 10MB is selected
- **THEN** an error message is displayed and the file is rejected

### Requirement: Image upload
The system SHALL upload the image to R2 storage before submitting the transaction, including the returned URL in the transaction payload.

#### Scenario: Image uploaded successfully
- **WHEN** the form is submitted with an image
- **THEN** the image is uploaded to R2 and the URL is included in the transaction

#### Scenario: Image upload fails
- **WHEN** the image upload fails
- **THEN** an error is displayed and the user can retry or submit without the image
