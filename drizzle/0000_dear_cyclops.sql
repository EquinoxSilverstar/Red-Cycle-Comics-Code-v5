CREATE TABLE `artwork` (
	`id` text PRIMARY KEY NOT NULL,
	`payload` text
);
--> statement-breakpoint
CREATE TABLE `settings` (
	`id` text PRIMARY KEY NOT NULL,
	`payload` text NOT NULL
);
