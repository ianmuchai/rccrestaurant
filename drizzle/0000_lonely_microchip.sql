CREATE TABLE `menu_overrides` (
	`id` text PRIMARY KEY NOT NULL,
	`value` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `order_history` (
	`id` text PRIMARY KEY NOT NULL,
	`order_id` text NOT NULL,
	`status` text NOT NULL,
	`actor` text NOT NULL,
	`created` text NOT NULL,
	FOREIGN KEY (`order_id`) REFERENCES `orders`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `orders` (
	`id` text PRIMARY KEY NOT NULL,
	`reference` text NOT NULL,
	`token_hash` text NOT NULL,
	`idempotency` text NOT NULL,
	`name` text NOT NULL,
	`phone` text NOT NULL,
	`fulfillment` text NOT NULL,
	`address` text NOT NULL,
	`point` text,
	`zone` text,
	`notes` text NOT NULL,
	`lines` text NOT NULL,
	`subtotal` integer NOT NULL,
	`fee` integer NOT NULL,
	`total` integer NOT NULL,
	`status` text DEFAULT 'pending' NOT NULL,
	`payment` text DEFAULT 'pending' NOT NULL,
	`created` text NOT NULL,
	`updated` text NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `orders_idempotency_unique` ON `orders` (`idempotency`);--> statement-breakpoint
CREATE TABLE `payments` (
	`id` text PRIMARY KEY NOT NULL,
	`order_id` text NOT NULL,
	`checkout_id` text,
	`phone` text NOT NULL,
	`amount` integer NOT NULL,
	`state` text NOT NULL,
	`receipt` text,
	`event` text,
	`created` text NOT NULL,
	`updated` text NOT NULL,
	FOREIGN KEY (`order_id`) REFERENCES `orders`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `payments_checkout_id_unique` ON `payments` (`checkout_id`);--> statement-breakpoint
CREATE UNIQUE INDEX `payments_receipt_unique` ON `payments` (`receipt`);--> statement-breakpoint
CREATE TABLE `rate_limits` (
	`key` text PRIMARY KEY NOT NULL,
	`count` integer NOT NULL,
	`expires` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `settings` (
	`key` text PRIMARY KEY NOT NULL,
	`value` text NOT NULL
);
