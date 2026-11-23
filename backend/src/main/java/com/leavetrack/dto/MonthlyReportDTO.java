package com.leavetrack.dto;

public class MonthlyReportDTO {

    private String period; // e.g., "Nov 2026"
    private long totalRequests;
    private long approvedRequests;
    private long rejectedRequests;
    private long pendingRequests;
    private long totalDaysTaken;

    public MonthlyReportDTO() {}

    public MonthlyReportDTO(String period, long totalRequests, long approvedRequests, 
                            long rejectedRequests, long pendingRequests, long totalDaysTaken) {
        this.period = period;
        this.totalRequests = totalRequests;
        this.approvedRequests = approvedRequests;
        this.rejectedRequests = rejectedRequests;
        this.pendingRequests = pendingRequests;
        this.totalDaysTaken = totalDaysTaken;
    }

    public String getPeriod() { return period; }
    public void setPeriod(String period) { this.period = period; }

    public long getTotalRequests() { return totalRequests; }
    public void setTotalRequests(long totalRequests) { this.totalRequests = totalRequests; }

    public long getApprovedRequests() { return approvedRequests; }
    public void setApprovedRequests(long approvedRequests) { this.approvedRequests = approvedRequests; }

    public long getRejectedRequests() { return rejectedRequests; }
    public void setRejectedRequests(long rejectedRequests) { this.rejectedRequests = rejectedRequests; }

    public long getPendingRequests() { return pendingRequests; }
    public void setPendingRequests(long pendingRequests) { this.pendingRequests = pendingRequests; }

    public long getTotalDaysTaken() { return totalDaysTaken; }
    public void setTotalDaysTaken(long totalDaysTaken) { this.totalDaysTaken = totalDaysTaken; }
}
