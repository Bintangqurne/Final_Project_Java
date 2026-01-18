-- phpMyAdmin SQL Dump
-- version 5.2.3
-- https://www.phpmyadmin.net/
--
-- Host: my_mysql
-- Generation Time: Jan 10, 2026 at 08:54 AM
-- Server version: 8.0.44
-- PHP Version: 8.3.26

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `finpro_db`
--

-- --------------------------------------------------------

--
-- Table structure for table `products`
--

CREATE TABLE `products` (
  `id` bigint NOT NULL,
  `active` bit(1) NOT NULL,
  `created_at` datetime(6) NOT NULL,
  `deleted_at` datetime(6) DEFAULT NULL,
  `description` text,
  `image_path` varchar(255) DEFAULT NULL,
  `name` varchar(255) NOT NULL,
  `price` decimal(19,2) NOT NULL,
  `stock` int NOT NULL,
  `updated_at` datetime(6) NOT NULL,
  `category_id` bigint DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `products`
--

INSERT INTO `products` (`id`, `active`, `created_at`, `deleted_at`, `description`, `image_path`, `name`, `price`, `stock`, `updated_at`, `category_id`) VALUES
(1, b'1', '2025-12-29 02:49:14.000000', NULL, 'Obat penurun panas dan pereda nyeri', NULL, 'Paracetamol 500mg', 5000.00, 82, '2025-12-29 06:04:11.407393', 1),
(2, b'1', '2025-12-29 02:49:14.000000', NULL, 'Obat anti nyeri dan anti inflamasi', NULL, 'Ibuprofen 400mg', 7000.00, 71, '2025-12-29 06:04:11.407446', 1),
(3, b'1', '2025-12-29 02:49:14.000000', NULL, 'Obat sakit kepala dan demam', NULL, 'Bodrex', 3000.00, 148, '2025-12-29 04:45:27.987285', 1),
(4, b'1', '2025-12-29 02:49:14.000000', NULL, 'Obat maag dan asam lambung', NULL, 'Antasida DOEN', 4000.00, 120, '2025-12-29 02:49:14.000000', 1),
(5, b'1', '2025-12-29 02:49:14.000000', NULL, 'Antibiotik untuk infeksi bakteri', NULL, 'Amoxicillin 500mg', 12000.00, 60, '2025-12-29 02:49:14.000000', 2),
(6, b'1', '2025-12-29 02:49:14.000000', NULL, 'Suplemen vitamin C', NULL, 'Vitamin C 500mg', 8000.00, 90, '2025-12-29 02:49:14.000000', 2),
(7, b'1', '2025-12-29 02:49:14.000000', NULL, 'Suplemen daya tahan tubuh', NULL, 'Imboost Capsule', 15000.00, 70, '2025-12-29 02:49:14.000000', 2),
(8, b'1', '2025-12-29 02:49:14.000000', NULL, 'Obat untuk diare', NULL, 'Diapet Capsule', 6000.00, 100, '2025-12-29 02:49:14.000000', 2),
(9, b'1', '2025-12-29 02:49:14.000000', NULL, 'Obat batuk berdahak', NULL, 'OBH Sirup', 18000.00, 50, '2025-12-29 02:49:14.000000', 3),
(10, b'1', '2025-12-29 02:49:14.000000', NULL, 'Obat batuk kering', NULL, 'Siladex Sirup', 17000.00, 45, '2025-12-29 02:49:14.000000', 3),
(11, b'1', '2025-12-29 02:49:14.000000', NULL, 'Penurun panas anak', '/uploads/products/product-11-1766977026239.png', 'Paracetamol Anak Sirup', 20000.00, 40, '2025-12-29 02:57:10.242769', NULL),
(12, b'1', '2025-12-29 02:49:14.000000', NULL, 'Vitamin anak rasa jeruk', NULL, 'Vitamin Anak Sirup', 22000.00, 35, '2025-12-29 02:49:14.000000', 3),
(13, b'1', '2025-12-29 02:49:14.000000', NULL, 'Obat tetes mata iritasi', NULL, 'Insto Tetes Mata', 16000.00, 60, '2025-12-29 02:49:14.000000', 4),
(14, b'1', '2025-12-29 02:49:14.000000', NULL, 'Obat tetes mata kering', NULL, 'Rohto Cool', 15000.00, 55, '2025-12-29 02:49:14.000000', 4),
(15, b'1', '2025-12-29 02:49:14.000000', NULL, 'Obat tetes telinga', NULL, 'Ear Drop', 14000.00, 30, '2025-12-29 02:49:14.000000', 4),
(16, b'1', '2025-12-29 02:49:14.000000', NULL, 'Obat tetes hidung pilek', NULL, 'Nasal Drop', 13000.00, 25, '2025-12-29 04:36:45.157677', 4),
(17, b'1', '2025-12-29 02:49:14.000000', NULL, 'Salep kulit anti jamur', '/uploads/products/product-17-1766977123918.jpeg', 'Miconazole Cream', 11000.00, 40, '2025-12-29 02:58:46.705762', NULL),
(18, b'1', '2025-12-29 02:49:14.000000', NULL, 'Salep luka dan iritasi', '/uploads/products/product-18-1766977106369.webp', 'Betadine Salep', 19000.00, 50, '2025-12-29 02:58:28.459496', NULL),
(19, b'1', '2025-12-29 02:49:14.000000', NULL, 'Krim pereda gatal', '/uploads/products/product-19-1766977080350.jpg', 'Hydrocortisone Cream', 13000.00, 45, '2025-12-29 02:58:08.177653', NULL),
(20, b'1', '2025-12-29 02:49:14.000000', NULL, 'Salep antiseptik', '/uploads/products/product-20-1766977056010.jpeg', 'Neosporin Salep', 21000.00, 35, '2025-12-29 02:57:38.131038', NULL);

--
-- Indexes for dumped tables
--

--
-- Indexes for table `products`
--
ALTER TABLE `products`
  ADD PRIMARY KEY (`id`),
  ADD KEY `FKog2rp4qthbtt2lfyhfo32lsw9` (`category_id`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `products`
--
ALTER TABLE `products`
  MODIFY `id` bigint NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=21;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `products`
--
ALTER TABLE `products`
  ADD CONSTRAINT `FKog2rp4qthbtt2lfyhfo32lsw9` FOREIGN KEY (`category_id`) REFERENCES `categories` (`id`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
