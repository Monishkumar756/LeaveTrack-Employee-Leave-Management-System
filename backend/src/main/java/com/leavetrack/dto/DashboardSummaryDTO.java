package com.leavetrack.dto;

import java.util.List;

public class DashboardSummaryDTO {

    private long totalEmployees;
    private long pendingRequests;
    private long approvedRequests;
    private long rejectedRequests;
    private List<LeaveBalanceDTO> myBalances;
    private List<LeaveRequestDTO> recentRequests;

    public DashboardSummaryDTO() {}

    public long getTotalEmployees() { return totalEmployees; }
    public void setTotalEmployees(long totalEmployees) { this.totalEmployees = totalEmployees; }

    public long getPendingRequests() { return pendingRequests; }
    public void setPendingRequests(long pendingRequests) { this.pendingRequests = pendingRequests; }

    public long getApprovedRequests() { return approvedRequests; }
    public void setApprovedRequests(long approvedRequests) { this.approvedRequests = approvedRequests; }

    public long getRejectedRequests() { return rejectedRequests; }
    public void setRejectedRequests(long rejectedRequests) { this.rejectedRequests = rejectedRequests; }

    public List<LeaveBalanceDTO> getMyBalances() { return myBalances; }
    public void setMyBalances(List<LeaveBalanceDTO> myBalances) { this.myBalances = myBalances; }

    public List<LeaveRequestDTO> getRecentRequests() { return recentRequests; }
    public void setRecentRequests(List<LeaveRequestDTO> recentRequests) { this.recentRequests = recentRequests; }
}
