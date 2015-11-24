<?php
/**
 * The main template file.
 *
 * This is the most generic template file in a WordPress theme
 * and one of the two required files for a theme (the other being style.css).
 * It is used to display a page when nothing more specific matches a query.
 * E.g., it puts together the home page when no home.php file exists.
 * Learn more: http://codex.wordpress.org/Template_Hierarchy
 *
 * @author Matthias Thom | http://upplex.de
 * @package upBootWP 1.1
 */

get_header(); ?>
	<div class="container" style="margin-top:-50px;">
		<div class="row">
			<div class="col-md-12">
				<div id="primary" class="content-area">
					<main id="main" class="site-main" role="main">
					</main><!-- #main -->
				</div><!-- #primary -->
			</div><!-- .col-md-8 -->
		</div><!-- .row -->
	</div><!-- .container -->
<?php get_footer(); ?>