CREATE INDEX IF NOT EXISTS `idx_transactions_user_date` ON `transactions` (`user_id`, `date`);--> statement-breakpoint
CREATE INDEX IF NOT EXISTS `idx_transactions_user_type` ON `transactions` (`user_id`, `type`);--> statement-breakpoint
CREATE INDEX IF NOT EXISTS `idx_transactions_user_category` ON `transactions` (`user_id`, `category_id`);--> statement-breakpoint
CREATE INDEX IF NOT EXISTS `idx_categories_user` ON `categories` (`user_id`);--> statement-breakpoint
CREATE INDEX IF NOT EXISTS `idx_goals_user_type` ON `goals` (`user_id`, `type`);
