/* DATABASE SETUP SCRIPT
  Run this in your local MS SQL Server Management Studio (SSMS)
  to create the database and all the required tables.
*/

/* 1. Create the database */
CREATE DATABASE UniversityManagementSystem;
GO

/* 2. Use the new database */
USE UniversityManagementSystem;
GO

/* 3. Create the Student table */
CREATE TABLE Student
(
    student_id INT PRIMARY KEY IDENTITY(1,1),
    student_name NVARCHAR(100) NOT NULL,
    enrollment_year INT
);
GO

SELECT *from Grade

/* 4. Create the Course table */
CREATE TABLE Course
(
    course_id NVARCHAR(50) PRIMARY KEY,
    -- Using NVARCHAR for IDs like 'CS-101'
    course_name NVARCHAR(100) NOT NULL,
    credits INT
);
GO

/* 5. Create the Enrollment table */
CREATE TABLE Enrollment
(
    enrollment_id INT PRIMARY KEY IDENTITY(1,1),
    student_id INT NOT NULL,
    course_id NVARCHAR(50) NOT NULL,

    -- Create foreign keys to link the tables
    CONSTRAINT FK_Enrollment_Student FOREIGN KEY (student_id) REFERENCES Student(student_id) ON DELETE CASCADE,
    CONSTRAINT FK_Enrollment_Course FOREIGN KEY (course_id) REFERENCES Course(course_id) ON DELETE CASCADE
);
GO

/* 6. Create the Grade table */
CREATE TABLE Grade
(
    grade_id INT PRIMARY KEY IDENTITY(1,1),
    enrollment_id INT NOT NULL,
    grade NVARCHAR(2) NOT NULL,

    -- Create a foreign key to Enrollment
    -- Use a UNIQUE constraint to ensure one grade per enrollment
    CONSTRAINT FK_Grade_Enrollment FOREIGN KEY (enrollment_id) REFERENCES Enrollment(enrollment_id) ON DELETE CASCADE,
    CONSTRAINT UQ_Grade_Enrollment UNIQUE (enrollment_id)
);
GO

/* 7. Insert the sample data (optional, but recommended) */
INSERT INTO Student
    (student_name, enrollment_year)
VALUES
    ('Alice Johnson', 2023),
    ('Bob Smith', 2022),
    ('Charlie Brown', 2024);

INSERT INTO Course
    (course_id, course_name, credits)
VALUES
    ('CS-101', 'Database Systems', 4),
    ('NET-200', 'Computer Networks', 3),
    ('ART-100', 'Art History', 3);

INSERT INTO Enrollment
    (student_id, course_id)
VALUES
    (1, 'CS-101'),
    -- Alice in Database Systems
    (1, 'NET-200'),
    -- Alice in Computer Networks
    (2, 'CS-101');
-- Bob in Database Systems

INSERT INTO Grade
    (enrollment_id, grade)
VALUES
    (1, 'A'),
    -- Alice in Database Systems gets an 'A'
    (2, 'B+'),
    -- Alice in Computer Networks gets a 'B+'
    (3, 'C');  -- Bob in Database Systems gets a 'C'

GO

-- PRINT 'Database, tables, and sample data created successfully.';


-- SELECT @@SERVERNAME AS 'Server Name';

-- SELECT SERVERPROPERTY('MachineName') AS 'Machine Name',
--        SERVERPROPERTY('ServerName') AS 'Server Name',
--        SERVERPROPERTY('InstanceName') AS 'Instance Name';

-- EXEC xp_instance_regwrite N'HKEY_LOCAL_MACHINE', N'Software\Microsoft\MSSQLServer\MSSQLServer', N'LoginMode', REG_DWORD, 2

-- SELECT CASE SERVERPROPERTY('IsIntegratedSecurityOnly')   
--          WHEN 1 THEN 'Windows Authentication Only'   
--          WHEN 0 THEN 'Mixed Mode (SQL and Windows)'   
--        END as AuthenticationMode;