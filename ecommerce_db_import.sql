-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Jun 23, 2026 at 07:30 PM
-- Server version: 10.4.32-MariaDB
-- PHP Version: 8.0.30

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `ecommerce_db`
--

-- --------------------------------------------------------

--
-- Table structure for table `cart_items`
--

CREATE TABLE `cart_items` (
  `id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `product_id` int(11) NOT NULL,
  `quantity` int(11) NOT NULL DEFAULT 1,
  `added_at` datetime DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `newsletter_subscribers`
--

CREATE TABLE `newsletter_subscribers` (
  `id` int(11) NOT NULL,
  `email` varchar(255) NOT NULL,
  `subscribed_at` datetime DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `newsletter_subscribers`
--

INSERT INTO `newsletter_subscribers` (`id`, `email`, `subscribed_at`) VALUES
(1, 'raselsumon51511@gmail.com', '2026-03-13 00:17:56');

-- --------------------------------------------------------

--
-- Table structure for table `orders`
--

CREATE TABLE `orders` (
  `id` int(11) NOT NULL,
  `user_id` int(11) DEFAULT NULL,
  `email` varchar(150) DEFAULT NULL,
  `first_name` varchar(100) DEFAULT NULL,
  `last_name` varchar(100) DEFAULT NULL,
  `country` varchar(100) DEFAULT NULL,
  `street` varchar(255) DEFAULT NULL,
  `city` varchar(100) DEFAULT NULL,
  `district` varchar(100) DEFAULT NULL,
  `phone` varchar(20) DEFAULT NULL,
  `payment_method` varchar(50) DEFAULT NULL,
  `total` decimal(10,2) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `delivery_area` varchar(20) DEFAULT NULL,
  `tracking_code` varchar(30) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `orders`
--

INSERT INTO `orders` (`id`, `user_id`, `email`, `first_name`, `last_name`, `country`, `street`, `city`, `district`, `phone`, `payment_method`, `total`, `created_at`, `delivery_area`, `tracking_code`) VALUES
(1, 1930661378, NULL, 'MD RASEL SUMON', NULL, NULL, 'Uttar Narayanpur, Sadhuhati 7200, Jhenaidaha Sadar, Jhenaidaha', 'Jhenaidaha', 'Dhaka', '01930661378', 'ক্যাশ অন ডেলিভারি', 830.00, '2026-02-24 11:47:30', 'dhaka', NULL),
(2, 1930661379, NULL, 'মোঃ রাসেল', NULL, NULL, 'Dhaka', 'Dhaka', 'ss', '01930661379', 'ক্যাশ অন ডেলিভারি', 3070.00, '2026-03-13 19:26:40', 'dhaka', NULL),
(3, 1930661379, NULL, 'মোঃ রাসেল', NULL, NULL, 'Jhenaidah, Chuadanga road, dakbangla bazar', 'Dakbangla Bazar Jhenaidah', '000000', '01930661379', 'ক্যাশ অন ডেলিভারি', 8120.00, '2026-03-14 19:44:31', 'outside', NULL),
(4, 1930661379, NULL, 'AAA', NULL, NULL, 'Jhenaidah, Chuadanga road, dakbangla bazar', 'Dakbangla Bazar Jhenaidah', 'k', '01930661379', 'ক্যাশ অন ডেলিভারি', 14030.00, '2026-03-25 06:50:02', 'dhaka', NULL),
(5, 1930661379, NULL, 'AAA', NULL, NULL, 'Jhenaidah, Chuadanga road, dakbangla bazar', 'Dakbangla Bazar Jhenaidah', 'kjjnjnjnjj', '01930661379', 'ক্যাশ অন ডেলিভারি', 7600.00, '2026-03-26 18:28:55', 'outside', NULL),
(6, 1930661379, NULL, 'j', NULL, NULL, 'Jhenaidah, Chuadanga road, dakbangla bazar', 'Dakbangla Bazar Jhenaidah', 'l', '01930661379', 'ক্যাশ অন ডেলিভারি', 5080.00, '2026-03-26 18:30:19', 'dhaka', NULL),
(7, 2147483647, NULL, 'Ruhul', NULL, NULL, 'Jhenaidah,Khulna,Bangladesh', 'Jhenaidah Sardar UZ', 'edrtetteeee', '+8801933141533', 'ক্যাশ অন ডেলিভারি', 229.00, '2026-06-10 19:00:36', 'outside', NULL),
(8, 2147483647, NULL, 'Ruhul', NULL, NULL, 'Jhenaidah,Khulna,Bangladesh', 'Jhenaidah Sardar UZ', 'edrtetteeee', '+8801933141533', 'ক্যাশ অন ডেলিভারি', 879.00, '2026-06-10 19:16:59', 'dhaka', NULL),
(9, 2147483647, NULL, 'Ruhul amin hridoy', NULL, NULL, 'Jhenaidah,Khulna,Bangladesh', 'Jhenaidah Sardar UZ', 'jhe', '+8801933141533', 'ক্যাশ অন ডেলিভারি', 5080.00, '2026-06-11 09:20:27', 'dhaka', NULL),
(10, 2147483647, NULL, 'Ruhul amin hridoy', NULL, NULL, 'Jhenaidah,Khulna,Bangladesh', 'Jhenaidah Sardar UZ', 'jhe', '+8801933141533', 'ক্যাশ অন ডেলিভারি', 5080.00, '2026-06-11 09:20:34', 'dhaka', NULL),
(11, 2147483647, NULL, 'Ruhul amin hridoy', NULL, NULL, 'Jhenaidah,Khulna,Bangladesh', 'Jhenaidah Sardar UZ', 'jhe', '+8801933141533', 'ক্যাশ অন ডেলিভারি', 5080.00, '2026-06-11 09:20:40', 'dhaka', NULL),
(12, 2147483647, NULL, 'Ruhul amin hridoy', NULL, NULL, 'Jhenaidah,Khulna,Bangladesh', 'Jhenaidah Sardar UZ', 'jhe', '8801933141533', 'ক্যাশ অন ডেলিভারি', 1080.00, '2026-06-11 09:29:36', 'dhaka', 'LBD-00012-W24'),
(13, 2147483647, NULL, 'ruhul amin', NULL, NULL, 'ewtrewr', 'wrew', 'wrterewr', '8801933141533', 'ক্যাশ অন ডেলিভারি', 2719.00, '2026-06-23 17:25:32', 'outside', 'LBD-00013-ANK');

-- --------------------------------------------------------

--
-- Table structure for table `order_items`
--

CREATE TABLE `order_items` (
  `id` int(11) NOT NULL,
  `order_id` int(11) DEFAULT NULL,
  `product_id` int(11) NOT NULL,
  `quantity` int(11) NOT NULL,
  `price` decimal(10,2) NOT NULL,
  `order_status` varchar(50) DEFAULT 'pending'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `order_items`
--

INSERT INTO `order_items` (`id`, `order_id`, `product_id`, `quantity`, `price`, `order_status`) VALUES
(1, 1, 1, 1, 700.00, 'pending'),
(2, 1, 3, 1, 50.00, 'pending'),
(3, 2, 4, 1, 2490.00, 'pending'),
(4, 2, 2, 1, 500.00, 'pending'),
(5, 3, 1, 1, 5000.00, 'pending'),
(6, 3, 2, 1, 500.00, 'pending'),
(7, 3, 4, 1, 2490.00, 'pending'),
(8, 4, 4, 5, 2490.00, 'pending'),
(9, 4, 2, 3, 500.00, 'pending'),
(10, 5, 4, 3, 2490.00, 'pending'),
(11, 6, 1, 1, 5000.00, 'delivered'),
(12, 7, 5, 1, 99.00, 'pending'),
(13, 8, 5, 1, 99.00, 'shipped'),
(14, 8, 6, 1, 700.00, 'shipped'),
(15, 9, 8, 5, 1000.00, 'pending'),
(16, 10, 8, 5, 1000.00, 'pending'),
(17, 11, 8, 5, 1000.00, 'pending'),
(18, 12, 8, 1, 1000.00, 'cancelled'),
(19, 13, 5, 1, 99.00, 'shipped'),
(20, 13, 4, 1, 2490.00, 'shipped');

-- --------------------------------------------------------

--
-- Table structure for table `products`
--

CREATE TABLE `products` (
  `id` int(11) NOT NULL,
  `name` varchar(100) NOT NULL,
  `description` text DEFAULT NULL,
  `price` decimal(10,2) NOT NULL,
  `stock` int(11) DEFAULT 0,
  `image_name` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`image_name`)),
  `popularity` int(11) DEFAULT 0,
  `category` varchar(100) DEFAULT NULL,
  `discounted_price` decimal(10,2) DEFAULT NULL,
  `is_discount_enabled` tinyint(1) DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `products`
--

INSERT INTO `products` (`id`, `name`, `description`, `price`, `stock`, `image_name`, `popularity`, `category`, `discounted_price`, `is_discount_enabled`) VALUES
(4, 'Apexel 18X Telephoto Lens', '📸 Apexel 18X Telephoto Lens\r\nদূরের দৃশ্য এখন হবে একদম পরিষ্কার ও ডিটেইলস সহ!\r\nApexel 18X Telephoto Lens আপনার স্মার্টফোনকে পরিণত করবে শক্তিশালী জুম ক্যামেরায়। ভ্রমণ, প্রাকৃতিক দৃশ্য, স্টেডিয়াম, বন্যপ্রাণী, চাঁদ বা দূরের সাবজেক্ট—সবকিছুই এখন ১৮ গুণ বেশি কাছে এনে শার্প ছবি ও ভিডিও করা সম্ভব।\r\n✅ 18X শক্তিশালী অপটিক্যাল জুম\r\n✅ ক্লিয়ার ও হাই-ডিটেইল ইমেজ\r\n✅ ইউনিভার্সাল ক্লিপ – অধিকাংশ স্মার্টফোনে ব্যবহারযোগ্য\r\n✅ আউটডোর ফটোগ্রাফি ও ভিডিওর জন্য পারফেক্ট\r\n✅ লাইটওয়েট ও সহজে বহনযোগ্য\r\nআপনার মোবাইলেই প্রফেশনাল জুম এক্সপেরিয়েন্স — এখনই অর্ডার করুন এবং দূরের সৌন্দর্য ক্যাপচার করুন! 🚀', 2890.00, 210, '[\"B_1773429073096.jpeg\",\"C_1773429073108.jpeg\"]', 0, 'Lens', 2490.00, 1),
(5, 'Camera', 'bhbhbh', 888.00, 99, '[\"IMG-20250510-WA0003.jpg_1774553004562.jpeg\",\"PXL_20260215_145808531.NIGHT.jpg_1774553004567.jpeg\"]', 0, 'Camera', 99.00, 1),
(8, 'Umberlla', 'Order fast', 1000.00, 7, '[\"amb_1781150594963.jpg\"]', 0, 'NEEDED', 700.00, 1);

-- --------------------------------------------------------

--
-- Table structure for table `product_reviews`
--

CREATE TABLE `product_reviews` (
  `id` int(11) NOT NULL,
  `product_id` int(11) NOT NULL,
  `reviewer_name` varchar(100) NOT NULL,
  `phone` varchar(20) DEFAULT NULL,
  `rating` tinyint(1) NOT NULL DEFAULT 5,
  `comment` text DEFAULT NULL,
  `image_name` varchar(255) DEFAULT NULL,
  `is_approved` tinyint(1) DEFAULT 0,
  `created_at` datetime DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `product_reviews`
--

INSERT INTO `product_reviews` (`id`, `product_id`, `reviewer_name`, `phone`, `rating`, `comment`, `image_name`, `is_approved`, `created_at`) VALUES
(1, 5, 'Md. Ruhul amin', '01933141533', 4, 'Khub valo product ta', 'review_1781170407046.jpg', 1, '2026-06-11 15:33:27'),
(2, 4, 'Md. Ruhul amin', '01930661379', 5, 'syeuwiqwr', 'review_1781171025419.jpg', 1, '2026-06-11 15:43:45');

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `id` int(11) NOT NULL,
  `name` varchar(100) DEFAULT NULL,
  `email` varchar(150) DEFAULT NULL,
  `password` text NOT NULL,
  `created_at` datetime DEFAULT current_timestamp(),
  `role` varchar(50) DEFAULT 'user',
  `phone` varchar(20) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`id`, `name`, `email`, `password`, `created_at`, `role`, `phone`) VALUES
(8, NULL, NULL, '$2b$10$YXTw8wYN7jnW10BlAlLI/.i.gHfXPVDiO7co81WpvPU93lTax0/7C', '2025-10-15 06:24:36', 'admin', '01930661379'),
(9, NULL, NULL, '1234', '2025-10-15 07:23:01', 'user', '01930661310'),
(10, NULL, NULL, '1234', '2025-10-15 07:27:40', 'user', '01930661301'),
(11, NULL, NULL, '1234', '2026-02-03 12:23:38', 'user', 'test20');

-- --------------------------------------------------------

--
-- Table structure for table `user_details`
--

CREATE TABLE `user_details` (
  `id` int(11) NOT NULL,
  `name` varchar(100) DEFAULT NULL,
  `email` varchar(100) DEFAULT NULL,
  `comment` text DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `user_details`
--

INSERT INTO `user_details` (`id`, `name`, `email`, `comment`) VALUES
(1, 'Ruhul amin', 'ruhulamineasy@gmail.com', 'hey');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `cart_items`
--
ALTER TABLE `cart_items`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `newsletter_subscribers`
--
ALTER TABLE `newsletter_subscribers`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `orders`
--
ALTER TABLE `orders`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `order_items`
--
ALTER TABLE `order_items`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `products`
--
ALTER TABLE `products`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `product_reviews`
--
ALTER TABLE `product_reviews`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `user_details`
--
ALTER TABLE `user_details`
  ADD PRIMARY KEY (`id`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `cart_items`
--
ALTER TABLE `cart_items`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `newsletter_subscribers`
--
ALTER TABLE `newsletter_subscribers`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `orders`
--
ALTER TABLE `orders`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=14;

--
-- AUTO_INCREMENT for table `order_items`
--
ALTER TABLE `order_items`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=21;

--
-- AUTO_INCREMENT for table `products`
--
ALTER TABLE `products`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=9;

--
-- AUTO_INCREMENT for table `product_reviews`
--
ALTER TABLE `product_reviews`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=12;

--
-- AUTO_INCREMENT for table `user_details`
--
ALTER TABLE `user_details`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
