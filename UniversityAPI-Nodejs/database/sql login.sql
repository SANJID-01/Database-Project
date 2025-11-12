/* Run this script in VS Code to create the new
  login and user for your web application.
*/

/* 1. Create the new server-level login */
CREATE LOGIN web_user 
WITH PASSWORD = 'web_password123', 
CHECK_POLICY = OFF;
GO

/* 2. Switch to your project's database */
USE UniversityManagementSystem;
GO

/* 3. Create a database user linked to that login */
CREATE USER web_user FOR LOGIN web_user;
GO

/* 4. Give that user full 'db_owner' permissions */
ALTER ROLE db_owner ADD MEMBER web_user;
GO

PRINT 'Login "web_user" created and mapped to db_owner.';