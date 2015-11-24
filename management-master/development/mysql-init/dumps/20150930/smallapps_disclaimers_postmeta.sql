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
-- Table structure for table `disclaimers_postmeta`
--

DROP TABLE IF EXISTS `disclaimers_postmeta`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `disclaimers_postmeta` (
  `meta_id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `post_id` bigint(20) unsigned NOT NULL DEFAULT '0',
  `meta_key` varchar(255) DEFAULT NULL,
  `meta_value` longtext,
  PRIMARY KEY (`meta_id`),
  KEY `post_id` (`post_id`),
  KEY `meta_key` (`meta_key`)
) ENGINE=InnoDB AUTO_INCREMENT=160 DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `disclaimers_postmeta`
--

LOCK TABLES `disclaimers_postmeta` WRITE;
/*!40000 ALTER TABLE `disclaimers_postmeta` DISABLE KEYS */;
INSERT INTO `disclaimers_postmeta` VALUES (1,2,'_wp_page_template','default'),(4,5,'_menu_item_type','custom'),(5,5,'_menu_item_menu_item_parent','0'),(6,5,'_menu_item_object_id','5'),(7,5,'_menu_item_object','custom'),(8,5,'_menu_item_target',''),(9,5,'_menu_item_classes','a:1:{i:0;s:0:\"\";}'),(10,5,'_menu_item_xfn',''),(11,5,'_menu_item_url','#'),(12,20,'_edit_last','1'),(13,20,'_wp_page_template','default'),(14,22,'_edit_last','1'),(15,22,'_wp_page_template','default'),(16,28,'_edit_last','1'),(17,28,'_wp_page_template','default'),(18,29,'_menu_item_type','post_type'),(19,29,'_menu_item_menu_item_parent','32'),(20,29,'_menu_item_object_id','28'),(21,29,'_menu_item_object','page'),(22,29,'_menu_item_target',''),(23,29,'_menu_item_classes','a:1:{i:0;s:0:\"\";}'),(24,29,'_menu_item_xfn',''),(25,29,'_menu_item_url',''),(26,30,'_menu_item_type','post_type'),(27,30,'_menu_item_menu_item_parent','32'),(28,30,'_menu_item_object_id','22'),(29,30,'_menu_item_object','page'),(30,30,'_menu_item_target',''),(31,30,'_menu_item_classes','a:1:{i:0;s:0:\"\";}'),(32,30,'_menu_item_xfn',''),(33,30,'_menu_item_url',''),(34,31,'_menu_item_type','post_type'),(35,31,'_menu_item_menu_item_parent','32'),(36,31,'_menu_item_object_id','20'),(37,31,'_menu_item_object','page'),(38,31,'_menu_item_target',''),(39,31,'_menu_item_classes','a:1:{i:0;s:0:\"\";}'),(40,31,'_menu_item_xfn',''),(41,31,'_menu_item_url',''),(42,32,'_menu_item_type','custom'),(43,32,'_menu_item_menu_item_parent','0'),(44,32,'_menu_item_object_id','32'),(45,32,'_menu_item_object','custom'),(46,32,'_menu_item_target',''),(47,32,'_menu_item_classes','a:1:{i:0;s:0:\"\";}'),(48,32,'_menu_item_xfn',''),(49,32,'_menu_item_url','#'),(50,34,'_edit_last','1'),(51,34,'_wp_page_template','default'),(52,35,'_menu_item_type','post_type'),(53,35,'_menu_item_menu_item_parent','32'),(54,35,'_menu_item_object_id','34'),(55,35,'_menu_item_object','page'),(56,35,'_menu_item_target',''),(57,35,'_menu_item_classes','a:1:{i:0;s:0:\"\";}'),(58,35,'_menu_item_xfn',''),(59,35,'_menu_item_url',''),(60,36,'_menu_item_type','custom'),(61,36,'_menu_item_menu_item_parent','0'),(62,36,'_menu_item_object_id','36'),(63,36,'_menu_item_object','custom'),(64,36,'_menu_item_target',''),(65,36,'_menu_item_classes','a:1:{i:0;s:0:\"\";}'),(66,36,'_menu_item_xfn',''),(67,36,'_menu_item_url','#'),(68,37,'_menu_item_type','custom'),(69,37,'_menu_item_menu_item_parent','0'),(70,37,'_menu_item_object_id','37'),(71,37,'_menu_item_object','custom'),(72,37,'_menu_item_target',''),(73,37,'_menu_item_classes','a:1:{i:0;s:0:\"\";}'),(74,37,'_menu_item_xfn',''),(75,37,'_menu_item_url','#'),(76,38,'_edit_last','1'),(77,39,'_wp_page_template','default'),(78,39,'_edit_last','1'),(79,11,'_edit_last','1'),(80,11,'_wp_page_template','default'),(81,24,'_edit_last','1'),(82,24,'_wp_trash_meta_status','publish'),(83,24,'_wp_trash_meta_time','1422905026'),(84,26,'_edit_last','1'),(85,26,'_wp_trash_meta_status','publish'),(86,26,'_wp_trash_meta_time','1422905035'),(87,40,'_edit_last','1'),(88,40,'_wp_page_template','default'),(89,41,'_edit_last','1'),(90,41,'_wp_page_template','default'),(91,45,'_edit_last','1'),(92,45,'_wp_page_template','default'),(93,49,'_edit_last','1'),(94,49,'_wp_page_template','default'),(95,53,'_edit_last','1'),(96,53,'_wp_page_template','default'),(97,58,'_edit_last','1'),(98,58,'_wp_page_template','default'),(99,58,'_wp_trash_meta_status','publish'),(100,58,'_wp_trash_meta_time','1424893665'),(101,59,'_menu_item_type','post_type'),(102,59,'_menu_item_menu_item_parent','5'),(103,59,'_menu_item_object_id','39'),(104,59,'_menu_item_object','page'),(105,59,'_menu_item_target',''),(106,59,'_menu_item_classes','a:1:{i:0;s:0:\"\";}'),(107,59,'_menu_item_xfn',''),(108,59,'_menu_item_url',''),(109,60,'_menu_item_type','post_type'),(110,60,'_menu_item_menu_item_parent','5'),(111,60,'_menu_item_object_id','11'),(112,60,'_menu_item_object','page'),(113,60,'_menu_item_target',''),(114,60,'_menu_item_classes','a:1:{i:0;s:0:\"\";}'),(115,60,'_menu_item_xfn',''),(116,60,'_menu_item_url',''),(117,61,'_menu_item_type','post_type'),(118,61,'_menu_item_menu_item_parent','36'),(119,61,'_menu_item_object_id','41'),(120,61,'_menu_item_object','page'),(121,61,'_menu_item_target',''),(122,61,'_menu_item_classes','a:1:{i:0;s:0:\"\";}'),(123,61,'_menu_item_xfn',''),(124,61,'_menu_item_url',''),(125,62,'_menu_item_type','post_type'),(126,62,'_menu_item_menu_item_parent','36'),(127,62,'_menu_item_object_id','40'),(128,62,'_menu_item_object','page'),(129,62,'_menu_item_target',''),(130,62,'_menu_item_classes','a:1:{i:0;s:0:\"\";}'),(131,62,'_menu_item_xfn',''),(132,62,'_menu_item_url',''),(133,63,'_menu_item_type','post_type'),(134,63,'_menu_item_menu_item_parent','32'),(135,63,'_menu_item_object_id','45'),(136,63,'_menu_item_object','page'),(137,63,'_menu_item_target',''),(138,63,'_menu_item_classes','a:1:{i:0;s:0:\"\";}'),(139,63,'_menu_item_xfn',''),(140,63,'_menu_item_url',''),(141,64,'_menu_item_type','post_type'),(142,64,'_menu_item_menu_item_parent','36'),(143,64,'_menu_item_object_id','49'),(144,64,'_menu_item_object','page'),(145,64,'_menu_item_target',''),(146,64,'_menu_item_classes','a:1:{i:0;s:0:\"\";}'),(147,64,'_menu_item_xfn',''),(148,64,'_menu_item_url',''),(149,65,'_menu_item_type','post_type'),(150,65,'_menu_item_menu_item_parent','37'),(151,65,'_menu_item_object_id','53'),(152,65,'_menu_item_object','page'),(153,65,'_menu_item_target',''),(154,65,'_menu_item_classes','a:1:{i:0;s:0:\"\";}'),(155,65,'_menu_item_xfn',''),(156,65,'_menu_item_url',''),(157,1,'_wp_trash_meta_status','publish'),(158,1,'_wp_trash_meta_time','1427400531'),(159,1,'_wp_trash_meta_comments_status','a:1:{i:1;s:1:\"1\";}');
/*!40000 ALTER TABLE `disclaimers_postmeta` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2015-09-30 13:53:19
