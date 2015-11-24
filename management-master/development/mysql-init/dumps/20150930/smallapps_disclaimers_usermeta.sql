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
-- Table structure for table `disclaimers_usermeta`
--

DROP TABLE IF EXISTS `disclaimers_usermeta`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `disclaimers_usermeta` (
  `umeta_id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `user_id` bigint(20) unsigned NOT NULL DEFAULT '0',
  `meta_key` varchar(255) DEFAULT NULL,
  `meta_value` longtext,
  PRIMARY KEY (`umeta_id`),
  KEY `user_id` (`user_id`),
  KEY `meta_key` (`meta_key`)
) ENGINE=InnoDB AUTO_INCREMENT=20 DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `disclaimers_usermeta`
--

LOCK TABLES `disclaimers_usermeta` WRITE;
/*!40000 ALTER TABLE `disclaimers_usermeta` DISABLE KEYS */;
INSERT INTO `disclaimers_usermeta` VALUES (1,1,'nickname','admin'),(2,1,'first_name',''),(3,1,'last_name',''),(4,1,'description',''),(5,1,'rich_editing','true'),(6,1,'comment_shortcuts','false'),(7,1,'admin_color','fresh'),(8,1,'use_ssl','0'),(9,1,'show_admin_bar_front','true'),(10,1,'disclaimers_capabilities','a:1:{s:13:\"administrator\";b:1;}'),(11,1,'disclaimers_user_level','10'),(12,1,'dismissed_wp_pointers','wp360_locks,wp390_widgets'),(13,1,'show_welcome_panel','1'),(15,1,'disclaimers_dashboard_quick_press_last_post_id','3'),(16,1,'nav_menu_recently_edited','2'),(17,1,'managenav-menuscolumnshidden','a:4:{i:0;s:11:\"link-target\";i:1;s:11:\"css-classes\";i:2;s:3:\"xfn\";i:3;s:11:\"description\";}'),(18,1,'metaboxhidden_nav-menus','a:3:{i:0;s:8:\"add-post\";i:1;s:12:\"add-post_tag\";i:2;s:15:\"add-post_format\";}'),(19,1,'session_tokens','a:1:{s:64:\"d040b4c2ca2b825804c478fb13394abd79ce0f77344ace2bee0fc44f26691b98\";a:4:{s:10:\"expiration\";i:1443202325;s:2:\"ip\";s:13:\"96.246.216.43\";s:2:\"ua\";s:116:\"Mozilla/5.0 (Macintosh; Intel Mac OS X 10_10_5) AppleWebKit/600.8.9 (KHTML, like Gecko) Version/8.0.8 Safari/600.8.9\";s:5:\"login\";i:1443029525;}}');
/*!40000 ALTER TABLE `disclaimers_usermeta` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2015-09-30 13:53:15
