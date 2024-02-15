
Server Setup Guide
___________________
Welcome to the server README. This guide will walk you through the process of initializing the database for this project.

Prerequisites
______________

Before getting started, make sure you have PostgreSQL installed on your system. Follow the instructions below to install PostgreSQL:

Download PostgreSQL: Visit the official PostgreSQL website and download the appropriate installer for your operating system.

Installation: Follow the installation instructions provided by the installer. During the installation process, make sure to remember the master PostgreSQL password if you are prompted to create one as you will need it later.


Initializing the Database
____________________________
Follow these steps to initialize the database:

Open psql Shell: Once PostgreSQL is installed, open the psql shell. On Windows, you can do this by clicking the Windows key and typing "psql". On macOS, you can access it through the Terminal by typing psql.

For windows: Enter Master Password ( In the psql shell, press Enter until the password prompt appears. Enter your master PostgreSQL password that you set during installation.)

Execute SQL Script: Once you are logged in to the psql shell, copy the contents of the newdatabase.sql file and paste them into the shell. Press Enter to execute the script.

Verify Database Creation: To verify that the database has been successfully created, you can type \dt to see a list of tables. To check individual tables, type \d yourtablename.

Conclusion
______________________-
Following these steps should successfully initialize the database for this project