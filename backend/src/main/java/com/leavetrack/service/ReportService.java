package com.leavetrack.service;

import com.leavetrack.dto.DashboardSummaryDTO;
import com.leavetrack.dto.MonthlyReportDTO;
import com.leavetrack.entity.LeaveRequest;
import com.leavetrack.entity.LeaveStatus;
import com.leavetrack.entity.Role;
import com.leavetrack.repository.EmployeeRepository;
import com.leavetrack.repository.LeaveBalanceRepository;
import com.leavetrack.repository.LeaveRequestRepository;
import com.leavetrack.security.UserDetailsImpl;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.Month;
import java.time.format.TextStyle;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class ReportService {

    @Autowired
    private EmployeeRepository employeeRepository;

    @Autowired
    private LeaveRequestRepository leaveRequestRepository;

    @Autowired
    private LeaveBalanceService leaveBalanceService;

    @Autowired
    private LeaveRequestService leaveRequestService;

    public DashboardSummaryDTO getDashboardSummary(UserDetailsImpl currentUser) {
        DashboardSummaryDTO summary = new DashboardSummaryDTO();

        summary.setTotalEmployees(employeeRepository.count());

        List<LeaveRequest> allRequests = leaveRequestRepository.findAll();
        summary.setPendingRequests(allRequests.stream().filter(r -> r.getStatus() == LeaveStatus.PENDING).count());
        summary.setApprovedRequests(allRequests.stream().filter(r -> r.getStatus() == LeaveStatus.APPROVED).count());
        summary.setRejectedRequests(allRequests.stream().filter(r -> r.getStatus() == LeaveStatus.REJECTED).count());

        // Attach personal balances
        summary.setMyBalances(leaveBalanceService.getBalancesByEmployee(currentUser.getId(), LocalDate.now().getYear()));

        // Attach role-specific recent requests
        if (currentUser.getAuthorities().stream().anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"))) {
            summary.setRecentRequests(
                    allRequests.stream().limit(5).map(leaveRequestService::convertToDTO).collect(Collectors.toList())
            );
        } else if (currentUser.getAuthorities().stream().anyMatch(a -> a.getAuthority().equals("ROLE_MANAGER"))) {
            summary.setRecentRequests(
                    leaveRequestRepository.findByEmployeeManagerIdOrderByCreatedAtDesc(currentUser.getId())
                            .stream().limit(5).map(leaveRequestService::convertToDTO).collect(Collectors.toList())
            );
        } else {
            summary.setRecentRequests(
                    leaveRequestRepository.findByEmployeeIdOrderByCreatedAtDesc(currentUser.getId())
                            .stream().limit(5).map(leaveRequestService::convertToDTO).collect(Collectors.toList())
            );
        }

        return summary;
    }

    public List<MonthlyReportDTO> getMonthlyReports(int year) {
        List<LeaveRequest> yearRequests = leaveRequestRepository.findAll().stream()
                .filter(r -> r.getStartDate().getYear() == year)
                .collect(Collectors.toList());

        List<MonthlyReportDTO> reports = new ArrayList<>();

        for (int m = 1; m <= 12; m++) {
            final int monthVal = m;
            String monthName = Month.of(monthVal).getDisplayName(TextStyle.SHORT, Locale.ENGLISH) + " " + year;

            List<LeaveRequest> monthReqs = yearRequests.stream()
                    .filter(r -> r.getStartDate().getMonthValue() == monthVal)
                    .collect(Collectors.toList());

            long total = monthReqs.size();
            long approved = monthReqs.stream().filter(r -> r.getStatus() == LeaveStatus.APPROVED).count();
            long rejected = monthReqs.stream().filter(r -> r.getStatus() == LeaveStatus.REJECTED).count();
            long pending = monthReqs.stream().filter(r -> r.getStatus() == LeaveStatus.PENDING).count();
            long totalDays = monthReqs.stream()
                    .filter(r -> r.getStatus() == LeaveStatus.APPROVED)
                    .mapToLong(LeaveRequest::getTotalDays)
                    .sum();

            reports.add(new MonthlyReportDTO(monthName, total, approved, rejected, pending, totalDays));
        }

        return reports;
    }
}
