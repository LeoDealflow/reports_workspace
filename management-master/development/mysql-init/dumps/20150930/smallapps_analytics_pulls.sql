-- MySQL dump 10.13  Distrib 5.6.19, for osx10.7 (i386)
--
-- Host: rds-prod.dealflow.com    Database: smallapps
-- ------------------------------------------------------
-- Server version	5.6.19-log

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `analytics_pulls`
--

DROP TABLE IF EXISTS `analytics_pulls`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `analytics_pulls` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `email` varchar(256) NOT NULL,
  `date` varchar(1024) NOT NULL,
  `category` varchar(256) NOT NULL,
  `action` varchar(256) DEFAULT NULL,
  `context` varchar(256) DEFAULT NULL,
  `usertype` varchar(256) DEFAULT NULL,
  `sessioncount` varchar(256) DEFAULT NULL,
  `timesincelastlogin` varchar(256) DEFAULT NULL,
  `screenresolution` varchar(256) DEFAULT NULL,
  `browser` varchar(256) DEFAULT NULL,
  `browserversion` varchar(256) DEFAULT NULL,
  `operatingsystem` varchar(256) DEFAULT NULL,
  `operatingsystemversion` varchar(256) DEFAULT NULL,
  `country` varchar(256) DEFAULT NULL,
  `region` varchar(256) DEFAULT NULL,
  `metro` varchar(256) DEFAULT NULL,
  `city` varchar(256) DEFAULT NULL,
  `source` varchar(256) DEFAULT NULL,
  `sourcepath` varchar(1024) DEFAULT NULL,
  `networkdomain` varchar(256) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `analytics_pulls`
--

LOCK TABLES `analytics_pulls` WRITE;
/*!40000 ALTER TABLE `analytics_pulls` DISABLE KEYS */;
/*!40000 ALTER TABLE `analytics_pulls` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2015-09-30 13:54:24
