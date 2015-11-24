<?php
/**
 * The base configurations of the WordPress.
 *
 * This file has the following configurations: MySQL settings, Table Prefix,
 * Secret Keys, and ABSPATH. You can find more information by visiting
 * {@link http://codex.wordpress.org/Editing_wp-config.php Editing wp-config.php}
 * Codex page. You can get the MySQL settings from your web host.
 *
 * This file is used by the wp-config.php creation script during the
 * installation. You don't have to use the web site, you can just copy this file
 * to "wp-config.php" and fill in the values.
 *
 * @package WordPress
 */

/** Custom Block for determining environment **/
$this_url = 'http://'.$_SERVER[HTTP_HOST].$_SERVER[REQUEST_URI];
$url_pattern = '/reports.dealflow.com/';
$production = false;
preg_match($url_pattern, $this_url) ? $production = true : $production = false;
// End Custom Block

if($production){
	// ** MySQL settings - You can get this info from your web host ** //
	/** The name of the database for WordPress */
	define('DB_NAME', 'smallapps');

	/** MySQL database username */
	define('DB_USER', 'smallapps');

	/** MySQL database password */
	define('DB_PASSWORD', 'A75a#Hnd*9$4bR@VH5vy66T$*T%nP#@xP!qKsvj$Ku%t4HQbqXR2W7b');

	/** MySQL hostname */
	define('DB_HOST', 'rds-prod.dealflow.com');

	/** Database Charset to use in creating database tables. */
	define('DB_CHARSET', 'utf8');

	/** The Database Collate type. Don't change this if in doubt. */
	define('DB_COLLATE', '');
}
else{
	// ** MySQL settings - You can get this info from your web host ** //
	/** The name of the database for WordPress */
	define('DB_NAME', 'management');

	/** MySQL database username */
	define('DB_USER', 'root');

	/** MySQL database password */
	define('DB_PASSWORD', '');

	/** MySQL hostname */
	define('DB_HOST', '127.0.0.1');

	/** Database Charset to use in creating database tables. */
	define('DB_CHARSET', 'utf8');

	/** The Database Collate type. Don't change this if in doubt. */
	define('DB_COLLATE', '');
}

/**#@+
 * Authentication Unique Keys and Salts.
 *
 * Change these to different unique phrases!
 * You can generate these using the {@link https://api.wordpress.org/secret-key/1.1/salt/ WordPress.org secret-key service}
 * You can change these at any point in time to invalidate all existing cookies. This will force all users to have to log in again.
 *
 * @since 2.6.0
 */
define('AUTH_KEY',         'gax~[6meqiUe6=f4(D_%t=-lH;NJWa53=9U^msV+%cM)6]*0c#BqW6n?*Yz$-h9N');
define('SECURE_AUTH_KEY',  '=Z?Z%1!#[f<Jmzvgg6p@+..4QHAdN}vh(a_4tB+yH@#vT=nL$+2W^65+Mb+kD?nk');
define('LOGGED_IN_KEY',    '+<*qaR0N$2mqQ{sC-M95MlPa@?^`_X+!1^q>Dlp/Y?I&E}Uu+pQTqFHBK_Zx5jhW');
define('NONCE_KEY',        'WcrM.X6;o|u3x~oH&D.-btu0oT#<}/w|dGJ@d4 V<zc#nf<v+bZn,;CJ|/u}c#.s');
define('AUTH_SALT',        'zLioA<}:fl|:Xo=+|{OQ2+TI uV4uRK=/X]!TQk3W|(+aAC+.jufM|[^P!m(IL@^');
define('SECURE_AUTH_SALT', 'qbHA->Hg,d+exNBf-{7M[Z|}:NBsNyw-(/,5ER|jzqD<Z:Nw3>L2e)5|t]1~WSW1');
define('LOGGED_IN_SALT',   ':k7wS|@{UmZXDMqA-cMg~2a|H1A5+7-G_(|DKpVf%7X++lW#5oQzmj8M|U{|Z.|{');
define('NONCE_SALT',       '[?$b*q2{|DB.+ni7L-gi{TQ2x= ~?-!SU>[Cl$@$wMmG;%WuU,n:(+rj1HUHQF8%');

/**#@-*/

/**
 * WordPress Database Table prefix.
 *
 * You can have multiple installations in one database if you give each a unique
 * prefix. Only numbers, letters, and underscores please!
 */
$table_prefix  = 'disclaimers_';

/**
 * For developers: WordPress debugging mode.
 *
 * Change this to true to enable the display of notices during development.
 * It is strongly recommended that plugin and theme developers use WP_DEBUG
 * in their development environments.
 */
define('WP_DEBUG', false);

/* That's all, stop editing! Happy blogging. */

/** Absolute path to the WordPress directory. */
if ( !defined('ABSPATH') )
	define('ABSPATH', dirname(__FILE__) . '/');

/** Sets up WordPress vars and included files. */
require_once(ABSPATH . 'wp-settings.php');
