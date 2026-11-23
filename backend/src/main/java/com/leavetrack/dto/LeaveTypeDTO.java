package com.leavetrack.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public class LeaveTypeDTO {

    private Long id;

    @NotBlank(message = "Leave type name is required")
    private String name;

    private String description;

    @NotNull(message = "Default days is required")
    @Min(value = 1, message = "Default days must be at least 1")
    private Integer defaultDays;

    private Boolean carryForward = false;
    private Boolean isActive = true;

    public LeaveTypeDTO() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public Integer getDefaultDays() { return defaultDays; }
    public void setDefaultDays(Integer defaultDays) { this.defaultDays = defaultDays; }

    public Boolean getCarryForward() { return carryForward; }
    public void setCarryForward(Boolean carryForward) { this.carryForward = carryForward; }

    public Boolean getIsActive() { return isActive; }
    public void setIsActive(Boolean isActive) { this.isActive = isActive; }
}
