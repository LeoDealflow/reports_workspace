#!/bin/sh
#
# An example hook script to prepare a packed repository for use over
# dumb transports.
#
#exec git update-server-info
sudo GIT_WORK_TREE=/var/www/dealflow/management git checkout -f
sudo chown -R www-data:www-data /var/www/dealflow/management
sudo service apache2 restart