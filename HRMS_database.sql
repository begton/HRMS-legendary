-- ============================================================
--  HRMS DATABASE - DAB Enterprise LTD
--  Put this file in XAMPP and run via phpMyAdmin or MySQL CLI
-- ============================================================

CREATE DATABASE IF NOT EXISTS HRMS;
USE HRMS;

-- ----------------------------
-- Table: Department
-- ----------------------------
CREATE TABLE IF NOT EXISTS Department (
    DepartID    INT AUTO_INCREMENT PRIMARY KEY,
    DepartName  VARCHAR(100) NOT NULL UNIQUE
);

-- ----------------------------
-- Table: Position
-- ----------------------------
CREATE TABLE IF NOT EXISTS `Position` (
    PosID                   INT AUTO_INCREMENT PRIMARY KEY,
    PosName                 VARCHAR(100) NOT NULL,
    RequiredQualification   VARCHAR(255) NOT NULL
);

CREATE TABLE IF NOT EXISTS Employee (
    EmpID           INT AUTO_INCREMENT PRIMARY KEY,
    EmpFirstName    VARCHAR(50)  NOT NULL,
    EmpLastName     VARCHAR(50)  NOT NULL,
    EmpGender       ENUM('Male','Female','Other') NOT NULL,
    EmpDateOfBirth  DATE         NOT NULL,
    EmpEmail        VARCHAR(100) NOT NULL UNIQUE,
    EmpTelephone    VARCHAR(20)  NOT NULL,
    EmpAddress      VARCHAR(255) NOT NULL,
    EmpHireDate     DATE         NOT NULL,
    EmpStatus       ENUM('Active','On Leave','Left','Blacklisted','Deceased','On Mission') NOT NULL DEFAULT 'Active',
    DepartID        INT          NOT NULL,
    PosID           INT          NOT NULL,
    CONSTRAINT fk_emp_dept FOREIGN KEY (DepartID) REFERENCES Department(DepartID) ON UPDATE CASCADE,
    CONSTRAINT fk_emp_pos  FOREIGN KEY (PosID)    REFERENCES `Position`(PosID)     ON UPDATE CASCADE
);
-- ----------------------------
-- Table: Users  (a user IS an employee — 1-to-1)
-- ----------------------------
CREATE TABLE IF NOT EXISTS Users (
    UserID      INT AUTO_INCREMENT PRIMARY KEY,
    UserName    VARCHAR(50)  NOT NULL UNIQUE,
    Password    VARCHAR(255) NOT NULL,          -- store bcrypt hash
    EmpID       INT          NOT NULL UNIQUE,   -- one employee → one user account
    CONSTRAINT fk_user_emp FOREIGN KEY (EmpID) REFERENCES Employee(EmpID) ON UPDATE CASCADE ON DELETE CASCADE
);

-- ----------------------------
-- Seed: Departments
-- ----------------------------
INSERT INTO Department (DepartName) VALUES
    ('Human Resources'),
    ('Finance'),
    ('Sales'),
    ('Procurement'),
    ('Logistics'),
    ('IT');

-- ----------------------------
-- Seed: Positions
-- ----------------------------
INSERT INTO Position (PosName, RequiredQualification) VALUES
    ('HR Manager',          'Bachelor in Human Resource Management'),
    ('Accountant',          'Bachelor in Accounting or Finance'),
    ('Sales Representative','Diploma in Business or Marketing'),
    ('Procurement Officer', 'Bachelor in Supply Chain Management'),
    ('Logistics Coordinator','Diploma in Logistics'),
    ('IT Support',          'Bachelor in Computer Science or IT'),
    ('General Manager',     'Masters in Business Administration');

-- ----------------------------
-- Seed: Employees (sample data)
-- ----------------------------
INSERT INTO Employee (EmpFirstName, EmpLastName, EmpGender, EmpDateOfBirth, EmpEmail, EmpTelephone, EmpAddress, EmpHireDate, EmpStatus, DepartID, PosID) VALUES
    ('Alice',  'Uwase',    'Female', '1990-03-15', 'alice.uwase@dab.rw',    '0781000001', 'Kigali, Gasabo',    '2020-01-10', 'Active',    1, 1),
    ('Bob',    'Nkurunziza','Male',  '1988-07-22', 'bob.nkuru@dab.rw',     '0781000002', 'Kigali, Kicukiro',  '2019-06-01', 'On Leave',  2, 2),
    ('Claire', 'Mukamana', 'Female', '1995-11-05', 'claire.muka@dab.rw',   '0781000003', 'Kigali, Nyarugenge','2021-03-20', 'Active',    3, 3),
    ('David',  'Habimana', 'Male',   '1992-01-30', 'david.habi@dab.rw',    '0781000004', 'Kigali, Gasabo',    '2018-09-15', 'On Mission',4, 4),
    ('Eva',    'Ingabire', 'Female', '1993-05-18', 'eva.inga@dab.rw',      '0781000005', 'Kigali, Kicukiro',  '2022-02-28', 'On Leave',  1, 1),
    ('Frank',  'Bizimana', 'Male',   '1985-09-09', 'frank.bizi@dab.rw',    '0781000006', 'Kigali, Nyarugenge','2017-04-11', 'Active',    6, 6),
    ('Grace',  'Uwitonze', 'Female', '1997-12-25', 'grace.uwit@dab.rw',    '0781000007', 'Kigali, Gasabo',    '2023-01-05', 'On Leave',  3, 3),
    ('Henry',  'Tuyishime','Male',   '1991-08-14', 'henry.tuyi@dab.rw',    '0781000008', 'Kigali, Kicukiro',  '2020-07-19', 'Blacklisted',5,5),
    ('Irene',  'Akimana',  'Female', '1994-04-02', 'irene.aki@dab.rw',     '0781000009', 'Kigali, Gasabo',    '2021-11-30', 'Active',    2, 2),
    ('James',  'Niyomugabo','Male',  '1989-06-17', 'james.niyo@dab.rw',    '0781000010', 'Kigali, Nyarugenge','2016-08-22', 'Left',      6, 7);

-- ----------------------------
-- Seed: Admin User  (password = "admin123" hashed with bcrypt rounds=10)
-- The backend will re-hash on register; this seed uses a pre-hashed value.
-- Run:  node -e "const b=require('bcryptjs');console.log(b.hashSync('admin123',10))"
-- and replace the hash below if needed.
-- ----------------------------
INSERT INTO Users (UserName, Password, EmpID) VALUES
    ('admin', '$2b$10$M/ryM23dcVjizZVQezOZsOhU.64Q.uskkoddp1qlRweDqAx3wr6hO', 1);

-- ----------------------------
-- Useful Views (optional but handy)
-- ----------------------------
CREATE OR REPLACE VIEW vw_employees_on_leave AS
SELECT
    e.EmpID,
    CONCAT(e.EmpFirstName,' ',e.EmpLastName) AS FullName,
    e.EmpGender,
    e.EmpEmail,
    e.EmpTelephone,
    e.EmpHireDate,
    d.DepartName,
    p.PosName
FROM Employee e
JOIN Department d ON e.DepartID = d.DepartID
JOIN Position  p ON e.PosID    = p.PosID
WHERE e.EmpStatus = 'On Leave'
ORDER BY d.DepartName, e.EmpLastName;
