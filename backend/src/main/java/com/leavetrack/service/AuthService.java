package com.leavetrack.service;

import com.leavetrack.dto.JwtResponse;
import com.leavetrack.dto.LoginRequest;
import com.leavetrack.dto.RegisterRequest;
import com.leavetrack.entity.Employee;
import com.leavetrack.exception.BadRequestException;
import com.leavetrack.exception.DuplicateResourceException;
import com.leavetrack.repository.EmployeeRepository;
import com.leavetrack.security.JwtUtils;
import com.leavetrack.security.UserDetailsImpl;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;

@Service
public class AuthService {

    @Autowired
    private AuthenticationManager authenticationManager;

    @Autowired
    private EmployeeRepository employeeRepository;

    @Autowired
    private LeaveBalanceService leaveBalanceService;

    @Autowired
    private PasswordEncoder encoder;

    @Autowired
    private JwtUtils jwtUtils;

    public JwtResponse authenticateUser(LoginRequest loginRequest) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(loginRequest.getEmail(), loginRequest.getPassword())
        );

        SecurityContextHolder.getContext().setAuthentication(authentication);
        String jwt = jwtUtils.generateJwtToken(authentication);

        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
        Employee employee = employeeRepository.findByEmail(userDetails.getUsername())
                .orElseThrow(() -> new BadRequestException("Employee account not found"));

        if (!"ACTIVE".equalsIgnoreCase(employee.getStatus())) {
            throw new BadRequestException("Your account has been deactivated. Please contact HR.");
        }

        return new JwtResponse(
                jwt,
                employee.getId(),
                employee.getEmployeeId(),
                employee.getFirstName(),
                employee.getLastName(),
                employee.getEmail(),
                employee.getRole(),
                employee.getDepartment()
        );
    }

    @Transactional
    public Employee registerUser(RegisterRequest registerRequest) {
        if (employeeRepository.existsByEmail(registerRequest.getEmail())) {
            throw new DuplicateResourceException("Email is already registered: " + registerRequest.getEmail());
        }

        if (employeeRepository.existsByEmployeeId(registerRequest.getEmployeeId())) {
            throw new DuplicateResourceException("Employee ID already exists: " + registerRequest.getEmployeeId());
        }

        Employee manager = null;
        if (registerRequest.getManagerId() != null) {
            manager = employeeRepository.findById(registerRequest.getManagerId()).orElse(null);
        }

        Employee employee = new Employee(
                registerRequest.getEmployeeId(),
                registerRequest.getFirstName(),
                registerRequest.getLastName(),
                registerRequest.getEmail(),
                encoder.encode(registerRequest.getPassword()),
                registerRequest.getPhone(),
                registerRequest.getDepartment(),
                registerRequest.getRole(),
                manager
        );

        Employee saved = employeeRepository.save(employee);

        // Automatically allocate default leave balances for current calendar year
        leaveBalanceService.initializeBalancesForEmployee(saved, LocalDate.now().getYear());

        return saved;
    }
}
