package com.leavetrack.dto;

import com.leavetrack.entity.Role;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public class EmployeeUpdateRequest {

    @NotBlank(message = "First name is required")
    private String firstName;

    @NotBlank(message = "Last name is required")
    private String lastName;

    private String phone;

    @NotBlank(message = "Department is required")
    private String department;

    @NotNull(message = "Role is required")
    private Role role;

    private Long managerId;

    private String status;

    public EmployeeUpdateRequest() {}

    public String getFirstName() { return firstName; }
    public void setFirstName(String firstName) { this.firstName = firstName; }

    public String getLastName() { return lastName; }
    public void setLastName(String lastName) { this.lastName = lastName; }

    public String getPhone() { return phone; }
    public void setPhone(String phone) { this.phone = phone; }

    public String getDepartment() { return department; }
    public void setDepartment(String department) { this.department = department; }

    public Role getRole() { return role; }
    public void setRole(Role role) { this.role = role; }

    public Long getManagerId() { return managerId; }
    public void setManagerId(Long managerId) { this.managerId = managerId; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
}
