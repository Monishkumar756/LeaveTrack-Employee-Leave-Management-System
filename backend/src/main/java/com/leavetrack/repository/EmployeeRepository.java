package com.leavetrack.repository;

import com.leavetrack.entity.Employee;
import com.leavetrack.entity.Role;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface EmployeeRepository extends JpaRepository<Employee, Long> {

    Optional<Employee> findByEmail(String email);

    Optional<Employee> findByEmployeeId(String employeeId);

    Boolean existsByEmail(String email);

    Boolean existsByEmployeeId(String employeeId);

    List<Employee> findByRole(Role role);

    List<Employee> findByManagerId(Long managerId);
}
