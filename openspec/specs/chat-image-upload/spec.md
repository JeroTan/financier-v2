# chat-image-upload Specification

## Purpose
TBD - created by archiving change frontend-chat-ui. Update Purpose after archive.
## Requirements
### Requirement: Image attachment
The system SHALL allow users to attach an image (receipt) to their chat message with an optional text caption.

#### Scenario: Image selected
- **WHEN** a user selects an image file
- **THEN** a preview is displayed in the input area

#### Scenario: Image removed
- **WHEN** a user removes the attached image
- **THEN** the preview is cleared and the input returns to text-only mode

### Requirement: Image encoding
The system SHALL encode attached images as base64 strings before sending to the API.

#### Scenario: Image encoded
- **WHEN** a message with an image is sent
- **THEN** the image is encoded as base64 and included in the API request

### Requirement: File type validation
The system SHALL accept only image file types (JPEG, PNG, WebP, GIF) with a maximum size of 10MB.

#### Scenario: Valid image
- **WHEN** a JPEG image under 10MB is selected
- **THEN** the image is accepted and previewed

#### Scenario: Invalid file type
- **WHEN** a non-image file is selected
- **THEN** an error message is displayed and the file is rejected

#### Scenario: File too large
- **WHEN** an image over 10MB is selected
- **THEN** an error message is displayed and the file is rejected

