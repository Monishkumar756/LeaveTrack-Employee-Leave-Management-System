package com.leavetrack.config;

import com.leavetrack.entity.Employee;
import com.leavetrack.entity.LeaveType;
import com.leavetrack.entity.Role;
import com.leavetrack.repository.EmployeeRepository;
import com.leavetrack.repository.LeaveTypeRepository;
import com.leavetrack.service.LeaveBalanceService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Component
public class DataInitializer implements CommandLineRunner {

    private static final Logger logger = LoggerFactory.getLogger(DataInitializer.class);

    @Autowired
    private EmployeeRepository employeeRepository;

    @Autowired
    private LeaveTypeRepository leaveTypeRepository;

    @Autowired
    private LeaveBalanceService leaveBalanceService;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) throws Exception {
        logger.info("Initializing LeaveTrack seed data if needed...");

        // 1. Seed Leave Types if missing
        seedLeaveTypes();

        // 2. Seed Default Employees if missing
        seedEmployees();

        // 3. Initialize Leave Balances for all employees
        int currentYear = LocalDate.now().getYear();
        List<Employee> allEmployees = employeeRepository.findAll();
        for (Employee emp : allEmployees) {
            leaveBalanceService.initializeBalancesForEmployee(emp, currentYear);
        }

        logger.info("LeaveTrack database is ready.");
    }

    private void seedLeaveTypes() {
        if (!leaveTypeRepository.existsByName("Casual Leave")) {
            leaveTypeRepository.save(new LeaveType("Casual Leave", "For personal emergencies or leisure", 12, false, true));
        }
        if (!leaveTypeRepository.existsByName("Sick Leave")) {
            leaveTypeRepository.save(new LeaveType("Sick Leave", "For medical appointments or health issues", 10, false, true));
        }
        if (!leaveTypeRepository.existsByName("Paid Leave")) {
            leaveTypeRepository.save(new LeaveType("Paid Leave", "Annual earned vacation time", 15, true, true));
        }
        if (!leaveTypeRepository.existsByName("Maternity / Paternity Leave")) {
            leaveTypeRepository.save(new LeaveType("Maternity / Paternity Leave", "Parental leave for childcare", 90, false, true));
        }
    }

    private void seedEmployees() {
        // 1. Admin
        Optional<Employee> adminOpt = employeeRepository.findByEmail("admin@leavetrack.com");
        if (adminOpt.isEmpty()) {
            Employee admin = new Employee(
                    "ADM001", "System", "Admin", "admin@leavetrack.com",
                    passwordEncoder.encode("password123"), "+1-555-0100",
                    "Human Resources", Role.ROLE_ADMIN, null
            );
            employeeRepository.save(admin);
            logger.info("Created default Admin account: admin@leavetrack.com");
        } else {
            Employee admin = adminOpt.get();
            admin.setPassword(passwordEncoder.encode("password123"));
            employeeRepository.save(admin);
        }

        // 2. Manager
        Employee manager;
        Optional<Employee> managerOpt = employeeRepository.findByEmail("manager@leavetrack.com");
        if (managerOpt.isEmpty()) {
            Employee newManager = new Employee(
                    "MGR001", "Sarah", "Jenkins", "manager@leavetrack.com",
                    passwordEncoder.encode("password123"), "+1-555-0101",
                    "Engineering", Role.ROLE_MANAGER, null
            );
            manager = employeeRepository.save(newManager);
            logger.info("Created default Manager account: manager@leavetrack.com");
        } else {
            manager = managerOpt.get();
            manager.setPassword(passwordEncoder.encode("password123"));
            manager = employeeRepository.save(manager);
        }

        // 3. Employee 1 (Alex Morgan)
        Optional<Employee> emp1Opt = employeeRepository.findByEmail("alex@leavetrack.com");
        if (emp1Opt.isEmpty()) {
            Employee emp1 = new Employee(
                    "EMP001", "Alex", "Morgan", "alex@leavetrack.com",
                    passwordEncoder.encode("password123"), "+1-555-0102",
                    "Engineering", Role.ROLE_EMPLOYEE, manager
            );
            employeeRepository.save(emp1);
            logger.info("Created default Employee account: alex@leavetrack.com");
        } else {
            Employee emp1 = emp1Opt.get();
            emp1.setPassword(passwordEncoder.encode("password123"));
            emp1.setManager(manager);
            employeeRepository.save(emp1);
        }

        // 4. Employee 2 (David Chen)
        Optional<Employee> emp2Opt = employeeRepository.findByEmail("david@leavetrack.com");
        if (emp2Opt.isEmpty()) {
            Employee emp2 = new Employee(
                    "EMP002", "David", "Chen", "david@leavetrack.com",
                    passwordEncoder.encode("password123"), "+1-555-0103",
                    "Engineering", Role.ROLE_EMPLOYEE, manager
            );
            employeeRepository.save(emp2);
            logger.info("Created default Employee account: david@leavetrack.com");
        } else {
            Employee emp2 = emp2Opt.get();
            emp2.setPassword(passwordEncoder.encode("password123"));
            emp2.setManager(manager);
            employeeRepository.save(emp2);
        }
    }
}
