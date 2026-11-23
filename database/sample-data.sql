-- ==============================================================================
-- LeaveTrack: Employee Leave Management System
-- Sample Seed Data
-- ==============================================================================

USE leavetrack_db;

-- ------------------------------------------------------------------------------
-- 1. Insert Leave Types
-- ------------------------------------------------------------------------------
INSERT INTO leave_types (name, description, default_days, carry_forward, is_active) VALUES
('Casual Leave', 'For personal emergencies or leisure', 12, FALSE, TRUE),
('Sick Leave', 'For medical appointments or health issues', 10, FALSE, TRUE),
('Paid Leave', 'Annual earned vacation time', 15, TRUE, TRUE),
('Maternity / Paternity Leave', 'Parental leave for childbirth and childcare', 90, FALSE, TRUE);

-- ------------------------------------------------------------------------------
-- 2. Insert Employees (Default password for all demo accounts: password123)
-- BCrypt hash for 'password123': $2a$10$wT0lG7yRshf4iV7rVz4kEu57i1pC0h9N8kR7F0jZ/s9O8W0F9v4uG
-- Note: Spring Boot DataInitializer also checks and re-hashes to guarantee authentication.
-- ------------------------------------------------------------------------------
-- Admin
INSERT INTO employees (employee_id, first_name, last_name, email, password, phone, department, role, manager_id, status) VALUES
('ADM001', 'System', 'Admin', 'admin@leavetrack.com', '$2a$10$slYQmyNdGzTn7ZLBXBChFOC9f6kFjAqPhccnP6DxlWXx2lPk1C3G6', '+1-555-0100', 'Human Resources', 'ROLE_ADMIN', NULL, 'ACTIVE');

-- Manager
INSERT INTO employees (employee_id, first_name, last_name, email, password, phone, department, role, manager_id, status) VALUES
('MGR001', 'Sarah', 'Jenkins', 'manager@leavetrack.com', '$2a$10$slYQmyNdGzTn7ZLBXBChFOC9f6kFjAqPhccnP6DxlWXx2lPk1C3G6', '+1-555-0101', 'Engineering', 'ROLE_MANAGER', NULL, 'ACTIVE');

-- Employees
INSERT INTO employees (employee_id, first_name, last_name, email, password, phone, department, role, manager_id, status) VALUES
('EMP001', 'Alex', 'Morgan', 'alex@leavetrack.com', '$2a$10$slYQmyNdGzTn7ZLBXBChFOC9f6kFjAqPhccnP6DxlWXx2lPk1C3G6', '+1-555-0102', 'Engineering', 'ROLE_EMPLOYEE', 2, 'ACTIVE'),
('EMP002', 'David', 'Chen', 'david@leavetrack.com', '$2a$10$slYQmyNdGzTn7ZLBXBChFOC9f6kFjAqPhccnP6DxlWXx2lPk1C3G6', '+1-555-0103', 'Engineering', 'ROLE_EMPLOYEE', 2, 'ACTIVE');

-- ------------------------------------------------------------------------------
-- 3. Insert Initial Leave Balances for 2026
-- ------------------------------------------------------------------------------
-- Balances for EMP001 (Alex Morgan)
INSERT INTO leave_balances (employee_id, leave_type_id, year, total_days, used_days, remaining_days) VALUES
(3, 1, 2026, 12, 2, 10),
(3, 2, 2026, 10, 1, 9),
(3, 3, 2026, 15, 0, 15);

-- Balances for EMP002 (David Chen)
INSERT INTO leave_balances (employee_id, leave_type_id, year, total_days, used_days, remaining_days) VALUES
(4, 1, 2026, 12, 0, 12),
(4, 2, 2026, 10, 0, 10),
(4, 3, 2026, 15, 0, 15);

-- Balances for MGR001 (Sarah Jenkins)
INSERT INTO leave_balances (employee_id, leave_type_id, year, total_days, used_days, remaining_days) VALUES
(2, 1, 2026, 12, 0, 12),
(2, 2, 2026, 10, 0, 10),
(2, 3, 2026, 15, 0, 15);

-- ------------------------------------------------------------------------------
-- 4. Insert Sample Leave Requests
-- ------------------------------------------------------------------------------
INSERT INTO leave_requests (employee_id, leave_type_id, start_date, end_date, total_days, reason, status, manager_comment, reviewed_by, reviewed_at) VALUES
(3, 1, '2026-12-01', '2026-12-02', 2, 'Family function attendance', 'APPROVED', 'Approved. Enjoy your time!', 2, '2026-11-20 10:00:00'),
(3, 2, '2026-12-10', '2026-12-10', 1, 'Dental appointment and recovery', 'APPROVED', 'Approved, get well soon.', 2, '2026-11-21 11:30:00'),
(4, 3, '2026-12-24', '2026-12-28', 5, 'Year-end family holiday trip', 'PENDING', NULL, NULL, NULL);
