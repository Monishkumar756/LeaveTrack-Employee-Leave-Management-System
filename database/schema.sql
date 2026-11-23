-- ==============================================================================
-- LeaveTrack: Employee Leave Management System
-- Database Schema Script
-- Target Database: MySQL 8.0+
-- Database Name: leavetrack_db
-- ==============================================================================

CREATE DATABASE IF NOT EXISTS leavetrack_db 
CHARACTER SET utf8mb4 
COLLATE utf8mb4_unicode_ci;

USE leavetrack_db;

-- ------------------------------------------------------------------------------
-- 1. Table: employees
-- ------------------------------------------------------------------------------
DROP TABLE IF EXISTS leave_requests;
DROP TABLE IF EXISTS leave_balances;
DROP TABLE IF EXISTS leave_types;
DROP TABLE IF EXISTS employees;

CREATE TABLE employees (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    employee_id VARCHAR(30) NOT NULL UNIQUE,
    first_name VARCHAR(50) NOT NULL,
    last_name VARCHAR(50) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    phone VARCHAR(20),
    department VARCHAR(50) NOT NULL,
    role VARCHAR(20) NOT NULL, -- ROLE_EMPLOYEE, ROLE_MANAGER, ROLE_ADMIN
    manager_id BIGINT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE', -- ACTIVE, INACTIVE
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_employee_manager FOREIGN KEY (manager_id) 
        REFERENCES employees(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------------------------
-- 2. Table: leave_types
-- ------------------------------------------------------------------------------
CREATE TABLE leave_types (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(50) NOT NULL UNIQUE,
    description VARCHAR(255),
    default_days INT NOT NULL,
    carry_forward BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------------------------
-- 3. Table: leave_balances
-- ------------------------------------------------------------------------------
CREATE TABLE leave_balances (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    employee_id BIGINT NOT NULL,
    leave_type_id BIGINT NOT NULL,
    year INT NOT NULL,
    total_days INT NOT NULL,
    used_days INT NOT NULL DEFAULT 0,
    remaining_days INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT uk_employee_leavetype_year UNIQUE (employee_id, leave_type_id, year),
    CONSTRAINT fk_balance_employee FOREIGN KEY (employee_id) 
        REFERENCES employees(id) ON DELETE CASCADE,
    CONSTRAINT fk_balance_leavetype FOREIGN KEY (leave_type_id) 
        REFERENCES leave_types(id) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------------------------
-- 4. Table: leave_requests
-- ------------------------------------------------------------------------------
CREATE TABLE leave_requests (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    employee_id BIGINT NOT NULL,
    leave_type_id BIGINT NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    total_days INT NOT NULL,
    reason TEXT NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'PENDING', -- PENDING, APPROVED, REJECTED, CANCELLED
    manager_comment VARCHAR(255) NULL,
    reviewed_by BIGINT NULL,
    reviewed_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_request_employee FOREIGN KEY (employee_id) 
        REFERENCES employees(id) ON DELETE CASCADE,
    CONSTRAINT fk_request_leavetype FOREIGN KEY (leave_type_id) 
        REFERENCES leave_types(id) ON DELETE RESTRICT,
    CONSTRAINT fk_request_reviewer FOREIGN KEY (reviewed_by) 
        REFERENCES employees(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Indexing for high-performance query execution
CREATE INDEX idx_employee_email ON employees(email);
CREATE INDEX idx_employee_role ON employees(role);
CREATE INDEX idx_request_status ON leave_requests(status);
CREATE INDEX idx_request_employee ON leave_requests(employee_id);
CREATE INDEX idx_balance_employee_year ON leave_balances(employee_id, year);
