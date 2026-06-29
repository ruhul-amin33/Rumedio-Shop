-- Add tracking_code to orders (if not exists)
ALTER TABLE `orders` ADD COLUMN IF NOT EXISTS `tracking_code` varchar(30) DEFAULT NULL;
ALTER TABLE `orders` ADD COLUMN IF NOT EXISTS `status` varchar(50) DEFAULT 'pending';

-- Create reviews table
CREATE TABLE IF NOT EXISTS `product_reviews` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `product_id` int(11) NOT NULL,
  `reviewer_name` varchar(100) NOT NULL,
  `phone` varchar(20) DEFAULT NULL,
  `rating` tinyint(1) NOT NULL DEFAULT 5,
  `comment` text DEFAULT NULL,
  `image_name` varchar(255) DEFAULT NULL,
  `is_approved` tinyint(1) DEFAULT 0,
  `created_at` datetime DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `product_id` (`product_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Index for tracking_code
CREATE INDEX IF NOT EXISTS idx_tracking ON orders(tracking_code);
