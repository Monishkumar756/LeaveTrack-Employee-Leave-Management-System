package com.leavetrack.controller;

import com.leavetrack.dto.DashboardSummaryDTO;
import com.leavetrack.dto.MonthlyReportDTO;
import com.leavetrack.security.UserDetailsImpl;
import com.leavetrack.service.ReportService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/reports")
public class ReportController {

    @Autowired
    private ReportService reportService;

    @GetMapping("/dashboard")
    public ResponseEntity<DashboardSummaryDTO> getDashboardSummary(@AuthenticationPrincipal UserDetailsImpl currentUser) {
        return ResponseEntity.ok(reportService.getDashboardSummary(currentUser));
    }

    @GetMapping("/monthly")
    @PreAuthorize("hasAnyAuthority('ROLE_ADMIN', 'ROLE_MANAGER')")
    public ResponseEntity<List<MonthlyReportDTO>> getMonthlyReports(@RequestParam(required = false) Integer year) {
        int targetYear = (year != null) ? year : LocalDate.now().getYear();
        return ResponseEntity.ok(reportService.getMonthlyReports(targetYear));
    }
}
