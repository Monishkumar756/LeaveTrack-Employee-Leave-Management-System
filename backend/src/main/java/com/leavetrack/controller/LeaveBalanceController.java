package com.leavetrack.controller;

import com.leavetrack.dto.LeaveBalanceDTO;
import com.leavetrack.security.UserDetailsImpl;
import com.leavetrack.service.LeaveBalanceService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/balances")
public class LeaveBalanceController {

    @Autowired
    private LeaveBalanceService leaveBalanceService;

    @GetMapping("/my-balances")
    public ResponseEntity<List<LeaveBalanceDTO>> getMyBalances(
            @AuthenticationPrincipal UserDetailsImpl currentUser,
            @RequestParam(required = false) Integer year) {
        int targetYear = (year != null) ? year : LocalDate.now().getYear();
        return ResponseEntity.ok(leaveBalanceService.getBalancesByEmployee(currentUser.getId(), targetYear));
    }

    @GetMapping("/employee/{empId}")
    @PreAuthorize("hasAnyAuthority('ROLE_ADMIN', 'ROLE_MANAGER')")
    public ResponseEntity<List<LeaveBalanceDTO>> getEmployeeBalances(
            @PathVariable Long empId,
            @RequestParam(required = false) Integer year) {
        int targetYear = (year != null) ? year : LocalDate.now().getYear();
        return ResponseEntity.ok(leaveBalanceService.getBalancesByEmployee(empId, targetYear));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    public ResponseEntity<LeaveBalanceDTO> updateBalanceQuota(@PathVariable Long id, @RequestBody Map<String, Integer> payload) {
        int totalDays = payload.getOrDefault("totalDays", 0);
        return ResponseEntity.ok(leaveBalanceService.updateBalanceQuota(id, totalDays));
    }
}
