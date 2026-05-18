# Product Requirements Document: Financier - AI-Powered Personal Finance Tracker

**Version**: 1.0
**Date**: 2026-05-18
**Author**: Sarah (Product Owner)
**Quality Score**: 91/100

---

## Executive Summary

Financier is a personal finance tracking application designed to make recording expenses and income as frictionless as possible. By combining AI-powered natural language chat (with image/receipt support) and traditional manual entry, users can log transactions in seconds rather than navigating complex forms.

The app targets individuals who want a simple, fast way to track their finances without the overhead of traditional accounting software. The AI chat interface parses natural language inputs (e.g., "spent 500 PHP on coffee today") and receipt images, then confirms details before saving to the database.

Built on Astro + React with Cloudflare Workers and D1, the app features a clean dashboard, Harvest Moon-inspired stat views, goal tracking, and full responsive design for mobile and desktop.

---

## Problem Statement

**Current Situation**: Manual expense tracking requires navigating forms, selecting categories, and entering amounts — creating friction that discourages consistent tracking habits.

**Proposed Solution**: An AI chat interface that accepts natural language and image inputs, parses transaction details automatically, and confirms before saving. Combined with a clean dashboard and intuitive stats views, tracking becomes effortless.

**Business Impact**: 
- Reduce transaction entry time from 30+ seconds to under 10 seconds
- Increase consistent daily tracking habits through frictionless UX
- Provide clear financial visibility through intuitive, game-inspired stat displays

---

## Success Metrics

**Primary KPIs:**
- **Frictionless Entry**: User can log a transaction via chat in under 10 seconds
- **AI Parsing Accuracy**: 95%+ of chat entries correctly parsed into transactions (amount, category, date, type)
- **Monthly Engagement**: User logs at least 30 transactions per month (consistent daily tracking habit)
- **Goal Visibility**: Users with set goals can see progress at a glance within 3 seconds of opening Stats

**Validation**: 
- AI accuracy measured by comparing parsed output vs. user corrections during confirmation step
- Engagement tracked via transaction count in D1
- UX timing measured via manual testing during development

---

## User Personas

### Primary: Personal Finance Tracker
- **Role**: Individual managing personal finances
- **Goals**: Track daily expenses and income effortlessly, monitor financial goals, understand spending patterns
- **Pain Points**: Traditional finance apps are too complex, manual entry is tedious, inconsistent tracking habits
- **Technical Level**: Intermediate (comfortable with chat interfaces, mobile apps)

### Secondary: Freelancer / Side Hustler
- **Role**: Individual with multiple income streams
- **Goals**: Track income from various sources, categorize expenses by project, set earning goals
- **Pain Points**: Need to separate personal vs. business expenses, want quick income logging
- **Technical Level**: Intermediate to Advanced

---

## User Stories & Acceptance Criteria

### Story 1: AI Chat Transaction Entry

**As a** personal finance tracker
**I want to** type or send an image in chat to record a transaction
**So that** I can log expenses/income in seconds without filling forms

**Acceptance Criteria:**
- [ ] User can type natural language (e.g., "spent 500 PHP on lunch") and AI parses amount, type, category, date
- [ ] User can send an image (receipt) with optional text, and AI extracts transaction details
- [ ] Before saving, AI displays parsed details and asks "Is this details correct?" for user confirmation
- [ ] User can confirm to save or correct any field before saving
- [ ] Confirmed transactions are saved to D1 database
- [ ] Chat messages are NOT stored in database (localStorage only)
- [ ] AI parsing accuracy is 95%+ for standard inputs

### Story 2: Manual Transaction Entry

**As a** personal finance tracker
**I want to** manually enter transactions via a form
**So that** I have an alternative to chat when needed

**Acceptance Criteria:**
- [ ] User can open manual entry form from sidebar "Entry" tab
- [ ] Form includes: type (income/expense), amount, date, category, description, optional image
- [ ] User can create custom categories
- [ ] Form validates required fields before submission
- [ ] Saved transactions appear immediately in dashboard and stats

### Story 3: Dashboard & Real-Time Stats

**As a** personal finance tracker
**I want to** see my monthly financial overview on the dashboard
**So that** I understand my current financial position at a glance

**Acceptance Criteria:**
- [ ] Dashboard shows: total income, total expenses, net revenue (green for positive, red for negative)
- [ ] Stats display covers current month by default
- [ ] Top 40% of dashboard shows stats; bottom 60% shows chat
- [ ] When chat starts, stats section disappears (100% chat view)
- [ ] Stats update in real-time after each transaction

### Story 4: Stats View (Harvest Moon Style)

**As a** personal finance tracker
**I want to** view my financial stats in daily, monthly, and yearly views
**So that** I can analyze my finances over different time periods

**Acceptance Criteria:**
- [ ] Stats displayed in clean ledger table format (Harvest Moon style: icons, color-coded values, easy to scan)
- [ ] User can switch between daily, monthly, and yearly views
- [ ] Shows income and expense breakdown per period
- [ ] Goal tracking display: daily/monthly/yearly goals (e.g., "Earn PHP 5,000 this month")
- [ ] Goals are user-settable but optional
- [ ] Progress indicators show goal completion status

### Story 5: Entity Management

**As a** personal finance tracker
**I want to** browse my transactions as cards with filtering and search
**So that** I can find and review specific entries

**Acceptance Criteria:**
- [ ] Transactions displayed as cards in list view with pagination
- [ ] Filters: All, Expense only, Income only
- [ ] Search by name, description, or category
- [ ] Date range filter (e.g., "show transactions from March")
- [ ] Each card shows: name, description (optional), value, positive/negative indicator, image (optional), categories (optional array)
- [ ] Entity metadata supports grouping/categorical views

### Story 6: Authentication & Settings

**As a** user
**I want to** register/login and manage my account settings
**So that** my financial data is secure and personalized

**Acceptance Criteria:**
- [ ] Registration via Google OAuth or email/password
- [ ] Login with registered credentials
- [ ] Settings page: change password, link/unlink Google account
- [ ] Appearance toggle: dark mode / light mode
- [ ] Settings persist across sessions

---

## Functional Requirements

### Core Features

**Feature 1: AI Chat Interface**
- Description: Natural language + image input for transaction entry using Kimi 2.6 model via Cloudflare AI
- User flow: User types message or sends image → AI parses → displays "Is this details correct?" with parsed data → user confirms or edits → transaction saved to D1
- Edge cases: Ambiguous input (AI asks clarifying questions), unsupported image format, network timeout
- Error handling: Fallback message if AI service unavailable, retry option, graceful degradation to manual entry

**Feature 2: Manual Entry Form**
- Description: Traditional form-based transaction entry as alternative to chat
- User flow: User opens Entry tab → fills form → submits → confirmation → saved to D1
- Edge cases: Invalid amount, missing required fields, duplicate entries
- Error handling: Inline validation, clear error messages, unsaved changes warning

**Feature 3: Dashboard with Dynamic Layout**
- Description: Split view (40% stats / 60% chat) that transitions to 100% chat when conversation starts
- User flow: User lands on dashboard → sees monthly stats + chat → starts chatting → stats hide → full chat view
- Edge cases: Page refresh during active chat (restore from localStorage), empty state (no transactions yet)
- Error handling: Stats loading states, chat connection error recovery

**Feature 4: Stats & Goal Tracking**
- Description: Harvest Moon-inspired ledger view with daily/monthly/yearly toggles and goal setting
- User flow: User opens Stats → selects time period → views income/expense breakdown → optionally sets goals → tracks progress
- Edge cases: No data for selected period, goals not set, extreme values
- Error handling: Empty state messages, goal progress calculations

**Feature 5: Entity Card List**
- Description: Paginated card view of all transactions with filtering, search, and date range
- User flow: User opens Entity → applies filters/search → browses cards → paginates through results
- Edge cases: No results match filter, large data sets, slow network
- Error handling: Loading states, empty results message, pagination edge cases

### Out of Scope
- Multi-currency support (MVP assumes single currency)
- Budget planning / forecasting
- Export to CSV/PDF
- Shared accounts or multi-user access
- Recurring transaction automation
- Bank account integration

---

## Technical Constraints

### Performance
- API calls < 200ms response time (edge-first Cloudflare Workers)
- AI chat streaming response starts within 1 second
- Dashboard stats load within 500ms
- Support 100+ concurrent users (personal app scale)

### Security
- **Authentication**: JWT-based auth with RS256 asymmetric signing, short-lived access tokens (15-30 min) + refresh tokens
- **Secrets Management**: Cloudflare Secrets Store for API keys, DB credentials, signing secrets — never committed to git
- **Data Encryption**: D1 encrypts data at rest (AES-256 GCM) and in transit (TLS 1.3) automatically
- **Session Security**: Token revocation list via Workers KV, rate limiting on auth endpoints (per IP/user)
- **Input Validation**: Zod schema validation on all API inputs, sanitization before D1 queries
- **CORS**: Restricted to app domain, no wildcard origins
- **GDPR/Privacy**: User data isolation (each user sees only their own transactions), chat logs stored client-side only (localStorage), no third-party data sharing

### Integration
- **Cloudflare AI**: Kimi 2.6 model (`@cf/moonshotai/kimi-k2.6`) for natural language parsing and image OCR
- **Cloudflare D1**: SQLite-based database for transaction storage, user accounts, categories, goals
- **Drizzle ORM**: Type-safe database queries and migrations
- **Google OAuth**: External identity provider for social login
- **Tool Calling**: AI agent uses tool calling to interact with database (create, read transactions)

### Technology Stack
- **Frontend**: Astro 6.x + React 19.x, shadcn/ui components, Tailwind CSS v4
- **Backend**: Cloudflare Workers (edge runtime)
- **Database**: Cloudflare D1 (SQLite), Drizzle ORM
- **AI**: Cloudflare AI Workers API, Kimi 2.6 model
- **Testing**: Vitest
- **Deployment**: Wrangler (Cloudflare CLI), environment-based configs (development/production)
- **Compatibility**: Modern browsers (Chrome, Firefox, Safari, Edge), responsive mobile + desktop

---

## MVP Scope & Phasing

### Phase 1: MVP (Required for Initial Launch)
- Google OAuth + email/password authentication
- SEO landing page
- Dashboard with monthly stats (income, expenses, net) and AI chat (40/60 split, stats hide on chat start)
- AI chat with natural language + image input, confirmation step ("Is this details correct?"), D1 save
- Manual entry form (Entry tab)
- Stats view with daily/monthly/yearly toggle (Harvest Moon ledger style)
- Entity card list with pagination, filters, search, date range
- Settings: password, linked accounts, dark/light mode
- Responsive design (mobile + desktop)
- Custom category creation
- Goal setting (daily/monthly/yearly, optional)

**MVP Definition**: A single-user finance tracker where you can log transactions via chat or form, view monthly stats, and browse all entries — all with a clean, fast, responsive UI.

### Phase 2: Enhancements (Post-Launch)
- Transaction editing and deletion
- Export to CSV
- Recurring transaction templates
- Budget alerts and notifications
- Multi-currency support

### Future Considerations
- Shared accounts / family mode
- Bank account integration (Plaid, etc.)
- AI-powered spending insights and predictions
- Receipt archiving and search

---

## Risk Assessment

| Risk | Probability | Impact | Mitigation Strategy |
|------|------------|--------|---------------------|
| AI parsing accuracy below 95% | Medium | High | Implement confirmation step ("Is this details correct?"), allow easy corrections, collect correction data to improve prompts |
| Cloudflare AI rate limits or downtime | Medium | High | Graceful fallback to manual entry, queue failed requests, display clear error messages |
| Chat localStorage data loss (clear browser) | Low | Medium | Chat is not transaction data — transactions are in D1. Only message history is lost, which is acceptable by design |
| JWT token compromise | Low | High | Short-lived tokens (15-30 min), refresh token rotation, revocation list via KV, HTTPS-only cookies |
| Scope creep with feature additions | High | Medium | Strict MVP definition, Phase 2 backlog, reject out-of-scope requests until MVP launch |
| D1 database performance at scale | Low | Medium | D1 handles 100+ concurrent users easily for personal app. Index queries, paginate Entity list, monitor query times |

---

## Dependencies & Blockers

**Dependencies:**
- **Cloudflare Account**: Workers, D1, AI bindings, Secrets Store — setup required before development
- **Google OAuth Credentials**: Google Cloud Console project with OAuth 2.0 client ID
- **Kimi 2.6 Model Access**: Confirm availability on Cloudflare AI platform (`@cf/moonshotai/kimi-k2.6`)
- **shadcn/ui Setup**: Initialize shadcn components in Astro + React project

**Known Blockers:**
- None currently identified. All dependencies are standard Cloudflare ecosystem tools.

---

## Appendix

### Glossary
- **Entity**: A transaction record (income or expense) with metadata: name, description, value, type (positive/negative), image, categories
- **Harvest Moon Style**: Clean ledger table UI inspired by the game's stat screens — icon-based, color-coded (green/red), easy to scan at a glance
- **Tool Calling**: AI agent capability to invoke functions (e.g., database operations) during conversation
- **D1**: Cloudflare's serverless SQLite database
- **MVP**: Minimum Viable Product — the smallest set of features that delivers core value

### References
- Cloudflare AI Chat Implementation: `docs/cloudflare_ai_chat.md`
- Cloudflare Workers Security: https://developers.cloudflare.com/workers/configuration/secrets/
- D1 Data Security: https://developers.cloudflare.com/d1/reference/data-security/
- JWT Edge Authentication: https://drcodes.com/posts/jwt-authentication-with-cloudflare-workers-complete-guide

---

*This PRD was created through interactive requirements gathering with quality scoring to ensure comprehensive coverage of business, functional, UX, and technical dimensions.*
