## ADDED Requirements

### Requirement: Tailwind core token safety
Application design tokens SHALL NOT override Tailwind v4 core scale tokens in a way that changes standard utility semantics.

#### Scenario: Max width utility remains standard
- **WHEN** an element uses `max-w-md`
- **THEN** it resolves to Tailwind's standard medium max width and not the app spacing token

#### Scenario: Spacing utility remains standard
- **WHEN** an element uses `p-6`, `w-full`, or `h-10`
- **THEN** the utility resolves according to Tailwind's core spacing scale

### Requirement: Component color aliases
The Tailwind theme SHALL define aliases for all color class names used by shadcn-derived components.

#### Scenario: Primary foreground alias
- **WHEN** a component uses `text-primary-foreground`
- **THEN** the class resolves to the configured on-primary text color

#### Scenario: Card and muted aliases
- **WHEN** components use `bg-card`, `text-card-foreground`, `bg-muted`, or `text-muted-foreground`
- **THEN** each class resolves to an intended theme color

#### Scenario: Gold aliases
- **WHEN** components use `bg-gold-500`, `text-gold-950`, or `hover:bg-gold-600`
- **THEN** each class resolves or is replaced by an equivalent project token
