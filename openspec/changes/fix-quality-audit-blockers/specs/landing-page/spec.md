## ADDED Requirements

### Requirement: Runtime-safe public configuration
The landing page SHALL read public configuration through Astro-supported runtime or fallback mechanisms.

#### Scenario: App URL fallback
- **WHEN** no `APP_URL` value is configured
- **THEN** the landing page renders with the default canonical URL instead of throwing

#### Scenario: App URL configured
- **WHEN** `APP_URL` is configured
- **THEN** canonical, Open Graph, and structured-data URLs use that value

### Requirement: Landing page smoke render
The landing page SHALL render successfully in local development and build output.

#### Scenario: Root route loads
- **WHEN** a browser visits `/`
- **THEN** the response contains the hero, navigation, feature section, and CTA content
