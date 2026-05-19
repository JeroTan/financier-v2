## 1. Project Setup

- [x] 1.1 Install Drizzle ORM and Drizzle Kit dependencies
- [x] 1.2 Create directory structure: `src/db/schema/`, `drizzle/migrations/`
- [x] 1.3 Configure Drizzle with Cloudflare D1 driver in `src/db/index.ts`
- [x] 1.4 Set up Drizzle Kit config file

## 2. Schema Definitions

- [x] 2.1 Create `users` schema in `src/db/schema/users.ts`
- [x] 2.2 Create `transactions` schema in `src/db/schema/transactions.ts`
- [x] 2.3 Create `categories` schema in `src/db/schema/categories.ts`
- [x] 2.4 Create `goals` schema in `src/db/schema/goals.ts`
- [x] 2.5 Create `src/db/schema/index.ts` exporting all schemas

## 3. Migrations

- [x] 3.1 Generate initial migration with `drizzle-kit generate`
- [x] 3.2 Apply migration to development D1 database
- [x] 3.3 Create index migration for query performance indexes
- [x] 3.4 Apply indexes migration to development D1

## 4. DTO Schemas

- [x] 4.1 Create Zod DTO for transaction creation in `src/server/dto/transaction.ts`
- [x] 4.2 Create Zod DTO for category creation in `src/server/dto/category.ts`
- [x] 4.3 Create Zod DTO for goal creation in `src/server/dto/goal.ts`
- [x] 4.4 Create Zod DTO for user creation in `src/server/dto/user.ts`
- [x] 4.5 Create Zod DTO for stats query parameters in `src/server/dto/stats.ts`

## 5. Transaction Repository

- [x] 5.1 Implement `createTransaction` in `src/server/repositories/transactionRepository.ts`
- [x] 5.2 Implement `getTransactions` with filtering (dateRange, type, category, pagination)
- [x] 5.3 Implement `aggregateTransactions` for income/expense/net totals
- [x] 5.4 Implement `getTransactionById`

## 6. Category Repository

- [x] 6.1 Implement `getCategoriesByUserId` in `src/server/repositories/categoryRepository.ts`
- [x] 6.2 Implement `createCategory` for custom categories
- [x] 6.3 Implement `seedDefaultCategories` with default category list
- [x] 6.4 Implement `deleteCategory` with default category protection

## 7. Goal Repository

- [x] 7.1 Implement `createGoal` in `src/server/repositories/goalRepository.ts`
- [x] 7.2 Implement `getGoalsByUserIdAndType`
- [x] 7.3 Implement `getGoalProgress` with transaction aggregation
- [x] 7.4 Implement `deleteGoal`

## 8. User Repository

- [x] 8.1 Implement `createUser` in `src/server/repositories/userRepository.ts`
- [x] 8.2 Implement `getUserByEmail`
- [x] 8.3 Implement `getUserByGoogleId`
- [x] 8.4 Implement `updateUserSettings`
- [x] 8.5 Implement `updatePassword`
