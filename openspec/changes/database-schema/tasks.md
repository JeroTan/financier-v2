## 1. Project Setup

- [ ] 1.1 Install Drizzle ORM and Drizzle Kit dependencies
- [ ] 1.2 Create directory structure: `src/db/schema/`, `drizzle/migrations/`
- [ ] 1.3 Configure Drizzle with Cloudflare D1 driver in `src/db/index.ts`
- [ ] 1.4 Set up Drizzle Kit config file

## 2. Schema Definitions

- [ ] 2.1 Create `users` schema in `src/db/schema/users.ts`
- [ ] 2.2 Create `transactions` schema in `src/db/schema/transactions.ts`
- [ ] 2.3 Create `categories` schema in `src/db/schema/categories.ts`
- [ ] 2.4 Create `goals` schema in `src/db/schema/goals.ts`
- [ ] 2.5 Create `src/db/schema/index.ts` exporting all schemas

## 3. Migrations

- [ ] 3.1 Generate initial migration with `drizzle-kit generate`
- [ ] 3.2 Apply migration to development D1 database
- [ ] 3.3 Create index migration for query performance indexes
- [ ] 3.4 Apply indexes migration to development D1

## 4. DTO Schemas

- [ ] 4.1 Create Zod DTO for transaction creation in `src/server/dto/transaction.ts`
- [ ] 4.2 Create Zod DTO for category creation in `src/server/dto/category.ts`
- [ ] 4.3 Create Zod DTO for goal creation in `src/server/dto/goal.ts`
- [ ] 4.4 Create Zod DTO for user creation in `src/server/dto/user.ts`
- [ ] 4.5 Create Zod DTO for stats query parameters in `src/server/dto/stats.ts`

## 5. Transaction Repository

- [ ] 5.1 Implement `createTransaction` in `src/server/repositories/transactionRepository.ts`
- [ ] 5.2 Implement `getTransactions` with filtering (dateRange, type, category, pagination)
- [ ] 5.3 Implement `aggregateTransactions` for income/expense/net totals
- [ ] 5.4 Implement `getTransactionById`

## 6. Category Repository

- [ ] 6.1 Implement `getCategoriesByUserId` in `src/server/repositories/categoryRepository.ts`
- [ ] 6.2 Implement `createCategory` for custom categories
- [ ] 6.3 Implement `seedDefaultCategories` with default category list
- [ ] 6.4 Implement `deleteCategory` with default category protection

## 7. Goal Repository

- [ ] 7.1 Implement `createGoal` in `src/server/repositories/goalRepository.ts`
- [ ] 7.2 Implement `getGoalsByUserIdAndType`
- [ ] 7.3 Implement `getGoalProgress` with transaction aggregation
- [ ] 7.4 Implement `deleteGoal`

## 8. User Repository

- [ ] 8.1 Implement `createUser` in `src/server/repositories/userRepository.ts`
- [ ] 8.2 Implement `getUserByEmail`
- [ ] 8.3 Implement `getUserByGoogleId`
- [ ] 8.4 Implement `updateUserSettings`
- [ ] 8.5 Implement `updatePassword`
