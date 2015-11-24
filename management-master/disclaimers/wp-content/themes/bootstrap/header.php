<?php
/**
 * The Header for our theme.
 *
 * Displays all of the <head> section and everything up till <main id="main">
 *
 * @author Matthias Thom | http://upplex.de
 * @package upBootWP 1.1
 */
?><!DOCTYPE html>
<html>
<head>
<meta name="viewport" content="width=device-width, initial-scale=1.0">
    <link rel='stylesheet' href='https://fonts.googleapis.com/css?family=Open+Sans:300italic,400italic,600italic,700italic,800italic,400,300,600,700,800' type='text/css'>
    <link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/font-awesome/4.3.0/css/font-awesome.min.css">
    <link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.4/css/bootstrap.min.css">
    <link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.4/css/bootstrap-theme.min.css">
    <link rel="stylesheet" type="text/css" href="/static/stylesheets/style.css" />
    <title>Dealflow Management Applications</title>

<?php wp_head(); ?>
</head>

<body>
<div class="navbar navbar-default navbar-fixed-top navbar-custom" role="navigation">
    <div class="container">
        <div class="navbar-header">
            <button type="button" class="navbar-toggle" data-toggle="collapse" data-target=".navbar-collapse"> <span class="icon-bar"></span> <span class="icon-bar"></span> <span class="icon-bar"></span> </button>
            <a class="navbar-brand" href="/">Dealflow.com</a> </div>
        <div class=" collapse navbar-collapse ">
            <ul class="nav navbar-nav">
                 <li><a href="/reports">Activity Reports</a>
                </li>
                <li><a href="/design">Graphic Design</a>
                </li>
                <li><a href="/disclaimers">Legal Disclaimers</a>
                </li>
                <li><a href="/marketing">Marketing Work</a>
                </li>
                <li><a href="/publications">Publication Production</a>
                </li>
               
                <!--<li><a href="#"><i class="fa fa-book"></i> Documentation</a></li>-->
            </ul>
        </div>
        <!--/.nav-collapse -->
    </div>
</div>
<div class="wordpress-navigation">
    <div class="container">
        <div class="row">
            <div class="col-xs-12 col-md-12">
                <p><span style="font-size: 18px; font-weight: 300;">Welcome to the Disclaimer Management Interface</span></p>
                <hr />
            </div>
        </div>
        <div class="row">
            <div class="col-md-12">
                <p>Below you will find the subnavigation for disclaimers</p>
                <br />
                
                <?php 
                $args = array('theme_location' => 'primary', 
                              'fallback_cb' => '',
                              'menu_id' => 'main');
                wp_nav_menu($args);
                ?>
            </div><!-- .col-md-12 -->
        </div>
        <div class="row">
            <div class="col-xs-12 col-md-12">
                <hr />
            </div>
        </div><!-- row -->
    </div><!-- container -->
</div>

<div id="content" class="site-content">
