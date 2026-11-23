# LeaveTrack – Employee Leave Management System

[![Java](https://img.shields.io/badge/Java-21%2B-ED8B00?style=for-the-badge&logo=openjdk&logoColor=white)](https://www.oracle.com/java/)
[![Spring Boot](https://img.shields.io/badge/Spring_Boot-3.3.5-6DB33F?style=for-the-badge&logo=spring-boot&logoColor=white)](https://spring.io/projects/spring-boot)
[![Spring Security](https://img.shields.io/badge/Spring_Security-6.x-6DB33F?style=for-the-badge&logo=spring-security&logoColor=white)](https://spring.io/projects/spring-security)
[![JWT](https://img.shields.io/badge/JWT-Stateless_Auth-000000?style=for-the-badge&logo=json-web-tokens&logoColor=white)](https://jwt.io/)
[![MySQL](https://img.shields.io/badge/MySQL-8.0-4479A1?style=for-the-badge&logo=mysql&logoColor=white)](https://www.mysql.com/)
[![React](https://img.shields.io/badge/React-18-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev/)

---

## 1. Project Overview

**LeaveTrack** is an enterprise-grade full-stack web application engineered for modern organizations to streamline and automate the entire leave management lifecycle. It bridges employees, line managers, and Human Resources/Administrators into a unified, secure portal.

The system enforces real-world business constraints (overlapping leave prevention, atomic balance deductions, weekend-aware working day calculations, role-based authorization, and comprehensive audit tracking) to deliver an industry-standard solution ideal for college internship evaluation.

---

## 2. Technology Stack

### Backend
- **Language**: Java 21+ (Java SE 24 Runtime Environment compatible)
- **Framework**: Spring Boot 3.3.5
- **Modules**:
  - `Spring Web` (RESTful Web Services)
  - `Spring Data JPA` (Hibernate ORM)
  - `Spring Security 6` (Stateless Authorization & BCrypt Password Hashing)
  - `Spring Validation` (Jakarta Bean Validation)
- **Security**: JSON Web Tokens (JJWT 0.12.6, HMAC-SHA256)
- **Database Driver**: MySQL Connector/J 8.3.0
- **Build Tool**: Apache Maven (via Maven Wrapper `mvnw`)

### Frontend
- **Library**: React.js 18
- **Routing**: React Router v6
- **HTTP Client**: Axios with JWT Request & Response Interceptors
- **Styling**: Modular CSS3 Design System with CSS Custom Properties
- **State Management**: React Context API (`AuthContext`)

### Database
- **Engine**: MySQL Server 8.0
- **Design**: 3rd Normal Form (3NF) relational schema with Foreign Keys and Composite Unique Constraints

---

## 3. System Architecture

LeaveTrack implements a strict **N-Tier Layered Architecture**:

```
+-----------------------------------------------------------------------------------+
|                                 PRESENTATION TIER                                 |
|  React.js (Port 3000)                                                             |
|  ├── React Router v6 (Protected Role Routes: /employee, /manager, /admin)         |
|  ├── Auth Context (JWT Storage & Global User State)                               |
|  ├── Axios Service Layer (Request Interceptor: Bearer Token, Response: 401 auto) |
|  └── UI: Responsive Dashboards, Sidebar, Badges, Modals, Balance Trackers        |
+------------------------------------------+----------------------------------------+
                                           | HTTP / REST (JSON)
                                           v
+-----------------------------------------------------------------------------------+
|                                 APPLICATION TIER                                  |
|  Spring Boot 3.3.5 / Java 21 (Port 8080)                                          |
|  ├── Security Filter Chain: Stateless JWT Authentication + Role Validation        |
|  ├── REST Controllers:                                                            |
|  │    ├── AuthController (/api/auth)                                              |
|  │    ├── EmployeeController (/api/employees)                                     |
|  │    ├── LeaveRequestController (/api/leaves)                                    |
|  │    ├── LeaveTypeController (/api/leave-types)                                  |
|  │    ├── LeaveBalanceController (/api/balances)                                  |
|  │    └── ReportController (/api/reports)                                         |
|  ├── Service Layer (@Transactional Business Logic):                               |
|  │    ├── Overlapping dates validation                                            |
|  │    ├── Start date <= End date validation                                       |
|  │    ├── Available quota checking                                                |
|  │    └── Atomic balance deduction upon Manager approval                          |
|  ├── Data Access Layer (Spring Data JPA Repositories)                             |
|  └── Global Exception Handler (@RestControllerAdvice -> RFC 7807 JSON errors)    |
+------------------------------------------+----------------------------------------+
                                           | JDBC / Hibernate ORM
                                           v
+-----------------------------------------------------------------------------------+
|                                 DATA TIER                                         |
|  MySQL Server 8.0 (Port 3306) -> Database: leavetrack_db                          |
|  ├── employees (id, emp_id, name, email, password, role, department, status)      |
|  ├── leave_types (id, name, description, default_days, carry_forward, is_active)  |
|  ├── leave_balances (id, emp_id, leave_type_id, year, total, used, remaining)     |
|  └── leave_requests (id, emp_id, leave_type_id, dates, days, reason, status)      |
+-----------------------------------------------------------------------------------+
```

---

## 4. Key Features by Role

### 👤 Employee Role
- **Secure Authentication**: Self-registration and login with JWT.
- **Personal Dashboard**: Live leave balances (Casual, Sick, Paid, Parental) and recent applications.
- **Leave Application**:
  - Selection of active leave policies.
  - Automatic exclusion of weekends (Saturdays & Sundays).
  - Client-side and server-side validation against remaining balance.
  - Prevention of past-date and inverted date applications.
- **Leave History**: Filterable list by status (`PENDING`, `APPROVED`, `REJECTED`, `CANCELLED`).
- **Cancellation**: Ability to cancel any `PENDING` leave request.

### 👔 Manager Role
- **Manager Dashboard**: Overview of pending team requests and annual statistics.
- **Leave Approval Queue**: View all subordinate leave applications.
- **Approve / Reject Action**:
  - Modal with request details.
  - Mandatory comment for rejections; optional comment for approvals.
  - Automatic balance updates upon approval.
  - Guard against duplicate processing.

### 🛡️ Administrator / HR Role
- **Admin Dashboard**: Corporate KPIs (total staff, department breakdown, approval trends).
- **Employee Directory**: Full CRUD (Add new employee, edit profiles, assign managers, toggle status).
- **Leave Policy Management**: Create and configure leave categories, quotas, carry-forward policies, and activation status.
- **Reports & Analytics**: Monthly and annual utilization reports tracking requests and total working days consumed.

---

## 5. Leave Management Business Logic & Validation Rules

1. **Different Leave Types**: Employees can apply for configured active leave policies.
2. **Date Order Integrity**: Start date cannot be after the end date (`startDate <= endDate`).
3. **Past-Date Application**: Disallows leave applications for dates before today (`startDate >= today`).
4. **No Overlapping Requests**: Backend checks that the employee has no pending or approved leave overlapping with the requested window:
   ```sql
   NOT (r.endDate < :startDate OR r.startDate > :endDate)
   ```
5. **Quota Protection**: Applications cannot exceed the remaining balance for that leave category.
6. **Manager Discretion**: Managers can approve or reject with comments.
7. **Atomic Balance Updates**:
   - On approval: `usedDays += totalDays` and `remainingDays -= totalDays` wrapped inside `@Transactional`.
   - On rejection: Zero deduction to employee balances.
8. **Idempotent Processing**: An already reviewed request (`APPROVED` or `REJECTED`) cannot be processed again.
9. **Automatic Employee Balance Seeding**: When a new employee is created, balances for all active leave types are automatically created for the current year.

---

## 6. Database Schema (`leavetrack_db`)

The database consists of 4 normalized tables:

```sql
employees
  ├── id (PK, BIGINT AUTO_INCREMENT)
  ├── employee_id (VARCHAR(30), UNIQUE)
  ├── first_name (VARCHAR(50))
  ├── last_name (VARCHAR(50))
  ├── email (VARCHAR(100), UNIQUE)
  ├── password (VARCHAR(255), BCrypt)
  ├── phone (VARCHAR(20))
  ├── department (VARCHAR(50))
  ├── role (VARCHAR(20): ROLE_EMPLOYEE, ROLE_MANAGER, ROLE_ADMIN)
  ├── manager_id (FK -> employees.id)
  └── status (VARCHAR(20): ACTIVE, INACTIVE)

leave_types
  ├── id (PK, BIGINT AUTO_INCREMENT)
  ├── name (VARCHAR(50), UNIQUE)
  ├── description (VARCHAR(255))
  ├── default_days (INT)
  ├── carry_forward (BOOLEAN)
  └── is_active (BOOLEAN)

leave_balances
  ├── id (PK, BIGINT AUTO_INCREMENT)
  ├── employee_id (FK -> employees.id)
  ├── leave_type_id (FK -> leave_types.id)
  ├── year (INT)
  ├── total_days (INT)
  ├── used_days (INT)
  └── remaining_days (INT)
  └── UNIQUE (employee_id, leave_type_id, year)

leave_requests
  ├── id (PK, BIGINT AUTO_INCREMENT)
  ├── employee_id (FK -> employees.id)
  ├── leave_type_id (FK -> leave_types.id)
  ├── start_date (DATE)
  ├── end_date (DATE)
  ├── total_days (INT)
  ├── reason (TEXT)
  ├── status (VARCHAR(20): PENDING, APPROVED, REJECTED, CANCELLED)
  ├── manager_comment (VARCHAR(255))
  ├── reviewed_by (FK -> employees.id)
  └── reviewed_at (TIMESTAMP)
```

---

## 7. REST API Endpoints Specification

| Method | Endpoint | Access | Purpose |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/auth/login` | Public | Authenticates user; returns JWT & profile |
| `POST` | `/api/auth/register` | Public / Admin | Registers user & seeds leave balances |
| `GET` | `/api/balances/my-balances` | Employee+ | Returns logged-in employee balances |
| `GET` | `/api/balances/employee/{id}` | Manager/Admin | Returns balances of a specific employee |
| `PUT` | `/api/balances/{id}` | Admin | Updates employee annual leave quota |
| `POST` | `/api/leaves/apply` | Employee+ | Submits leave request with validation |
| `GET` | `/api/leaves/my-leaves` | Employee+ | Returns logged-in employee leave history |
| `GET` | `/api/leaves/manager/pending`| Manager/Admin | Returns team leave requests for review |
| `GET` | `/api/leaves/all` | Admin | Returns all leave requests across company |
| `PUT` | `/api/leaves/{id}/review` | Manager/Admin | Approves or rejects request with comments |
| `PUT` | `/api/leaves/{id}/cancel` | Employee | Cancels pending leave request |
| `GET` | `/api/leave-types` | Authenticated | Lists all leave policies |
| `GET` | `/api/leave-types/active` | Authenticated | Lists currently active leave policies |
| `POST` | `/api/leave-types` | Admin | Creates new leave category |
| `PUT` | `/api/leave-types/{id}` | Admin | Updates leave policy details |
| `DELETE`| `/api/leave-types/{id}` | Admin | Removes leave policy |
| `GET` | `/api/employees` | Manager/Admin | Lists company employees |
| `GET` | `/api/employees/managers` | Authenticated | Lists employees with `ROLE_MANAGER` |
| `PUT` | `/api/employees/{id}` | Admin | Updates employee profile/manager/role |
| `DELETE`| `/api/employees/{id}` | Admin | Deletes employee |
| `GET` | `/api/reports/dashboard` | Authenticated | Returns role-specific dashboard metrics |
| `GET` | `/api/reports/monthly` | Manager/Admin | Monthly breakdown of leave statistics |

---

## 8. Demo Credentials

The backend comes pre-seeded with test accounts for immediate demonstration:

| Role | Email | Password | Pre-configured Context |
| :--- | :--- | :--- | :--- |
| **Admin** | `admin@leavetrack.com` | `password123` | HR Administrator with full system control |
| **Manager** | `manager@leavetrack.com` | `password123` | Engineering Manager with team subordinates |
| **Employee 1** | `alex@leavetrack.com` | `password123` | Software Engineer reporting to Sarah (Manager) |
| **Employee 2** | `david@leavetrack.com` | `password123` | Software Engineer reporting to Sarah (Manager) |

---

## 9. Installation & Execution Guide

### Step 1: Database Setup
1. Ensure MySQL Server is running on port `3306`.
2. Open MySQL Workbench or terminal and execute:
   ```sql
   CREATE DATABASE IF NOT EXISTS leavetrack_db;
   ```
3. *(Optional)* Import `database/schema.sql` and `database/sample-data.sql`. (Spring Boot's `DataInitializer` will also auto-seed if starting with a clean DB).

### Step 2: Running the Spring Boot Backend
1. Open a PowerShell terminal and navigate to the backend directory:
   ```powershell
   cd LeaveTrack\backend
   ```
2. Verify database credentials in `src\main\resources\application.properties`:
   ```properties
   spring.datasource.username=root
   spring.datasource.password=YourMySQLPassword
   ```
3. Run using the Maven wrapper:
   ```powershell
   .\mvnw.ps1 spring-boot:run
   ```
4. The backend starts on **`http://localhost:8080`**.

### Step 3: Running the React Frontend
1. Open a second PowerShell terminal and navigate to the frontend directory:
   ```powershell
   cd LeaveTrack\frontend
   ```
2. Install dependencies (if not already done):
   ```powershell
   npm install
   ```
3. Launch the development server:
   ```powershell
   npm start
   ```
4. The web application opens automatically at **`http://localhost:3000`**.

---

## 10. Internship Viva & Technical Interview Q&A

### Q1: Why did you choose JWT over traditional HTTP Sessions?
> **Answer**: HTTP Sessions are stateful and store session tokens in server memory, which limits scalability and requires sticky sessions in distributed environments. JWT is **stateless**: all user claims (id, email, roles) are cryptographically signed using HMAC-SHA256 and sent in the HTTP `Authorization: Bearer <token>` header. The server verifies the signature without requiring database lookups on every request, making it lightweight and horizontally scalable.

### Q2: How did you prevent race conditions when two managers approve leaves or when multiple requests are submitted?
> **Answer**: We utilized Spring's `@Transactional` annotation on `LeaveRequestService.reviewLeave()`. This ensures that updating the request status and deducting the leave balance execute as an **atomic database transaction**. Furthermore, we added an explicit check: `if (leaveRequest.getStatus() != LeaveStatus.PENDING) throw new BadRequestException(...)` to guarantee idempotency and prevent duplicate processing.

### Q3: How is date overlap checked in LeaveTrack?
> **Answer**: Instead of fetching all leaves into memory, we execute an optimized Spring Data JPA query:
> ```sql
> SELECT COUNT(r) > 0 FROM LeaveRequest r 
> WHERE r.employee.id = :employeeId 
>   AND r.status IN ('PENDING', 'APPROVED') 
>   AND NOT (r.endDate < :startDate OR r.startDate > :endDate)
> ```
> Two intervals $[S_1, E_1]$ and $[S_2, E_2]$ do not overlap if and only if $E_1 < S_2$ or $S_1 > E_2$. Negating this condition identifies any collision.

### Q4: Why use DTOs instead of directly returning JPA Entities?
> **Answer**:
> 1. **Security**: Entities contain sensitive attributes like password hashes. DTOs restrict payload exposure.
> 2. **Decoupling**: The database schema can evolve independently from client-facing REST contracts.
> 3. **Avoid Infinite Recursion**: Bidirectional JPA relationships (e.g., Employee -> Manager -> Employee) cause Jackson serialization loops (`StackOverflowError`) if entities are serialized directly.

### Q5: How do Axios Interceptors work in your React application?
> **Answer**: We created a centralized Axios instance (`api/axiosConfig.js`).
> - **Request Interceptor**: Reads the JWT from `localStorage` and automatically attaches `Authorization: Bearer <token>` to every HTTP request.
> - **Response Interceptor**: Listens for HTTP 401 Unauthorized status responses. If the token has expired, it automatically clears `localStorage` and redirects the user to the login screen with an expiration alert.
