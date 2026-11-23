package com.leavetrack.dto;

import com.leavetrack.entity.LeaveStatus;
import jakarta.validation.constraints.NotNull;

public class LeaveActionRequest {

    @NotNull(message = "Action status is required (APPROVED or REJECTED)")
    private LeaveStatus status;

    private String comment;

    public LeaveActionRequest() {}

    public LeaveStatus getStatus() { return status; }
    public void setStatus(LeaveStatus status) { this.status = status; }

    public String getComment() { return comment; }
    public void setComment(String comment) { this.comment = comment; }
}
