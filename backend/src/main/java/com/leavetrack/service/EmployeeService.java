package com.leavetrack.service;

import com.leavetrack.dto.EmployeeDTO;
import com.leavetrack.dto.EmployeeUpdateRequest;
import com.leavetrack.entity.Employee;
import com.leavetrack.entity.Role;
import com.leavetrack.exception.ResourceNotFoundException;
import com.leavetrack.repository.EmployeeRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class EmployeeService {

    @Autowired
    private EmployeeRepository employeeRepository;

    public List<EmployeeDTO> getAllEmployees() {
        return employeeRepository.findAll().stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    public EmployeeDTO getEmployeeById(Long id) {
        Employee employee = employeeRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Employee not found with id: " + id));
        return convertToDTO(employee);
    }

    public EmployeeDTO getEmployeeByEmail(String email) {
        Employee employee = employeeRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("Employee not found with email: " + email));
        return convertToDTO(employee);
    }

    public List<EmployeeDTO> getManagers() {
        return employeeRepository.findByRole(Role.ROLE_MANAGER).stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    @Transactional
    public EmployeeDTO updateEmployee(Long id, EmployeeUpdateRequest request) {
        Employee employee = employeeRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Employee not found with id: " + id));

        employee.setFirstName(request.getFirstName());
        employee.setLastName(request.getLastName());
        employee.setPhone(request.getPhone());
        employee.setDepartment(request.getDepartment());
        employee.setRole(request.getRole());

        if (request.getStatus() != null) {
            employee.setStatus(request.getStatus());
        }

        if (request.getManagerId() != null) {
            Employee manager = employeeRepository.findById(request.getManagerId())
                    .orElseThrow(() -> new ResourceNotFoundException("Manager not found with id: " + request.getManagerId()));
            employee.setManager(manager);
        } else {
            employee.setManager(null);
        }

        Employee updated = employeeRepository.save(employee);
        return convertToDTO(updated);
    }

    @Transactional
    public void deleteEmployee(Long id) {
        if (!employeeRepository.existsById(id)) {
            throw new ResourceNotFoundException("Employee not found with id: " + id);
        }
        employeeRepository.deleteById(id);
    }

    public EmployeeDTO convertToDTO(Employee emp) {
        EmployeeDTO dto = new EmployeeDTO();
        dto.setId(emp.getId());
        dto.setEmployeeId(emp.getEmployeeId());
        dto.setFirstName(emp.getFirstName());
        dto.setLastName(emp.getLastName());
        dto.setFullName(emp.getFullName());
        dto.setEmail(emp.getEmail());
        dto.setPhone(emp.getPhone());
        dto.setDepartment(emp.getDepartment());
        dto.setRole(emp.getRole());
        dto.setStatus(emp.getStatus());
        if (emp.getManager() != null) {
            dto.setManagerId(emp.getManager().getId());
            dto.setManagerName(emp.getManager().getFullName());
        }
        return dto;
    }
}
