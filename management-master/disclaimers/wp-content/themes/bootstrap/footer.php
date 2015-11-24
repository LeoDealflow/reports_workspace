<?php
/**
 * The template for displaying the footer.
 *
 * Contains the closing of the id=main div and all content after
 *
 * @author Matthias Thom | http://upplex.de
 * @package upBootWP 1.1
 */
?>

	</div><!-- #content -->
	<div class="page-footer">
        <div class="container">
            <br />
            <hr />
            <br />
            2013 - <span id="copyright-date"><script>var now = new Date(); document.write(now.getFullYear());</script></span> &copy; Dealflow.com, All Rights Reserved.
        </div>
    </div>
</div><!-- #page -->
<?php wp_footer(); ?>
<script src="//code.jquery.com/jquery-1.11.3.min.js"></script>
    <script src="//code.jquery.com/jquery-migrate-1.2.1.min.js"></script>
    <script src="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.4/js/bootstrap.min.js"></script>
    <script src="/static/javascripts/scripts.js"></script>
    <script>
    jQuery.noConflict();
    jQuery(document).ready(function() {
    });
    </script>
</body>
</html>