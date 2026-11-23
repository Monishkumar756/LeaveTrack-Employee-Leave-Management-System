package com.leavetrack.controller;

import com.leavetrack.dto.LeaveActionRequest;
import com.leavetrack.dto.LeaveApplicationRequest;
import com.leavetrack.dto.LeaveRequestDTO;
import com.leavetrack.security.UserDetailsImpl;
import com.leavetrack.service.LeaveRequestService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/leaves")
public class LeaveRequestController {

    @Autowired
    private LeaveRequestService leaveRequestService;

    @PostMapping("/apply")
    public ResponseEntity<LeaveRequestDTO> applyLeave(
            @AuthenticationPrincipal UserDetailsImpl currentUser,
            @Valid @RequestBody LeaveApplicationRequest request) {
        LeaveRequestDTO created = leaveRequestService.applyLeave(currentUser.getId(), request);
        return new ResponseEntity<>(created, HttpStatus.CREATED);
    }

    @GetMapping("/my-leaves")
    public ResponseEntity<List<LeaveRequestDTO>> getMyLeaves(@AuthenticationPrincipal UserDetailsImpl currentUser) {
        return ResponseEntity.ok(leaveRequestService.getEmployeeLeaves(currentUser.getId()));
    }

    @GetMapping("/manager/pending")
    @PreAuthorize("hasAnyAuthority('ROLE_MANAGER', 'ROLE_ADMIN')")
    public ResponseEntity<List<LeaveRequestDTO>> getManagerPendingLeaves(@AuthenticationPrincipal UserDetailsImpl currentUser) {
        return ResponseEntity.ok(leaveRequestService.getManagerPendingLeaves(currentUser.getId()));
    }

    @GetMapping("/all")
    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    public ResponseEntity<List<LeaveRequestDTO>> getAllLeaves() {
        return ResponseEntity.ok(leaveRequestService.getAllLeaves());
    }

    @PutMapping("/{id}/review")
    @PreAuthorize("hasAnyAuthority('ROLE_MANAGER', 'ROLE_ADMIN')")
    public ResponseEntity<LeaveRequestDTO> reviewLeave(
            @PathVariable Long id,
            @AuthenticationPrincipal UserDetailsImpl currentUser,
            @Valid @RequestBody LeaveActionRequest actionRequest) {
        LeaveRequestDTO reviewed = leaveRequestService.reviewLeave(id, currentUser.getId(), actionRequest);
        return ResponseEntity.ok(reviewed);
    }

    @PutMapping("/{id}/cancel")
    public ResponseEntity<LeaveRequestDTO> cancelLeave(
            @PathVariable Long id,
            @AuthenticationPrincipal UserDetailsImpl currentUser) {
        LeaveRequestDTO cancelled = leaveRequestService.cancelLeave(id, currentUser.getId());
        return ResponseEntity.ok(cancelled);
    }
}
