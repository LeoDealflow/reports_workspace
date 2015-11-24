DROP TABLE IF EXISTS `reports_mysql`;
-- phpMyAdmin SQL Dump
-- version 4.1.7
-- http://www.phpmyadmin.net
--
-- Host: localhost
-- Generation Time: Mar 05, 2015 at 01:52 PM
-- Server version: 5.5.40-0ubuntu0.12.04.1
-- PHP Version: 5.3.10-1ubuntu3.15

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8 */;

--
-- Database: `zadmin_dealflow`
--

-- --------------------------------------------------------

--
-- Table structure for table `dealflow_reports`
--

CREATE TABLE IF NOT EXISTS `reports_mysql` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `report_id` varchar(1024) NOT NULL,
  `report_query` text NOT NULL,
  `report_name` varchar(1024) NOT NULL,
  `created_at` datetime DEFAULT NULL,
  `updated_at` datetime DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB  DEFAULT CHARSET=utf8 AUTO_INCREMENT=1 ;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;