DROP TABLE IF EXISTS `marketing_sendgrid_events`;
-- phpMyAdmin SQL Dump
-- version 4.1.7
-- http://www.phpmyadmin.net
--
-- Host: localhost
-- Generation Time: Mar 05, 2015 at 01:52 PM
-- Server version: 5.5.40-0ubuntu0.12.04.1
-- PHP Version: 5.3.10-1ubuntu3.15

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
SET time_zone = "-05:00";


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

CREATE TABLE `marketing_sendgrid_events_temp` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `dealflow_id` INT NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `ip` VARCHAR(256) NULL,
  `sg_message_id` VARCHAR(256) NULL,
  `useragent` VARCHAR(3072) NULL,
  `event` VARCHAR(256) NULL,
  `email` VARCHAR(256) NULL,
  `timestamp` VARCHAR(256) NULL,
  `sendgrid_created_at` VARCHAR(256) NULL,
  `pulls_complete_to` VARCHAR(256) NULL,
  `category` VARCHAR(1024) NULL,
  `newsletters_user_list_id` VARCHAR(256) NULL,
  `newsletter_id` VARCHAR(256) NULL,
  `newsletter_send_id` VARCHAR(256) NULL,
  `user_id` VARCHAR(256) NULL,
  PRIMARY KEY (`id`)) ENGINE=InnoDB  DEFAULT CHARSET=utf8 AUTO_INCREMENT=1 ;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;