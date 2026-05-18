## ADDED Requirements

### Requirement: Meta tags
The system SHALL include SEO meta tags: title ("Financier - AI-Powered Personal Finance Tracker"), description, canonical URL, and viewport.

#### Scenario: Meta tags rendered
- **WHEN** the landing page is loaded
- **THEN** all required meta tags are present in the HTML head

### Requirement: Open Graph tags
The system SHALL include Open Graph meta tags for social sharing: og:title, og:description, og:image, og:url, and og:type.

#### Scenario: OG tags rendered
- **WHEN** the landing page URL is shared on social media
- **THEN** the preview displays the correct title, description, and image

### Requirement: Structured data
The system SHALL include JSON-LD structured data describing the application as a SoftwareApplication with name, description, and applicationCategory.

#### Scenario: Structured data present
- **WHEN** the page HTML is inspected
- **THEN** a JSON-LD script tag with SoftwareApplication schema is present

### Requirement: Sitemap
The system SHALL generate a `sitemap.xml` at build time listing all public pages.

#### Scenario: Sitemap generated
- **WHEN** the site is built
- **THEN** a `sitemap.xml` file is generated with the landing page URL
