package com.leavetrack.dto;

import com.leavetrack.entity.Role;

public class JwtResponse {

    private String token;
    private String type = "Bearer";
    private Long id;
    private String employeeId;
    private String firstName;
    private String lastName;
    private String email;
    private Role role;
    private String department;

    public JwtResponse(String token, Long id, String employeeId, String firstName, 
                       String lastName, String email, Role role, String department) {
        this.token = token;
        this.id = id;
        this.employeeId = employeeId;
        this.firstName = firstName;
        this.lastName = lastName;
        this.email = email;
        this.role = role;
        this.department = department;
    }

    public String getToken() { return token; }
    public void setToken(String token) { this.token = token; }

    public String getType() { return type; }
    public void setType(String type) { this.type = type; }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getEmployeeId() { return employeeId; }
    public void setEmployeeId(String employeeId) { this.employeeId = employeeId; }

    public String getFirstName() { return firstName; }
    public void setFirstName(String firstName) { this.firstName = firstName; }

    public String getLastName() { return lastName; }
    public void setLastName(String lastName) { this.lastName = lastName; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public Role getRole() { return role; }
    public void setRole(Role role) { this.role = role; }

    public String getDepartment() { return department; }
    public void setDepartment(String department) { this.department = department; }
}
