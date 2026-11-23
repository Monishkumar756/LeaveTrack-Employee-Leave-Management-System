package com.leavetrack.controller;

import com.leavetrack.dto.LeaveTypeDTO;
import com.leavetrack.service.LeaveTypeService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/leave-types")
public class LeaveTypeController {

    @Autowired
    private LeaveTypeService leaveTypeService;

    @GetMapping
    public ResponseEntity<List<LeaveTypeDTO>> getAllLeaveTypes() {
        return ResponseEntity.ok(leaveTypeService.getAllLeaveTypes());
    }

    @GetMapping("/active")
    public ResponseEntity<List<LeaveTypeDTO>> getActiveLeaveTypes() {
        return ResponseEntity.ok(leaveTypeService.getActiveLeaveTypes());
    }

    @GetMapping("/{id}")
    public ResponseEntity<LeaveTypeDTO> getLeaveTypeById(@PathVariable Long id) {
        return ResponseEntity.ok(leaveTypeService.getLeaveTypeById(id));
    }

    @PostMapping
    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    public ResponseEntity<LeaveTypeDTO> createLeaveType(@Valid @RequestBody LeaveTypeDTO dto) {
        LeaveTypeDTO created = leaveTypeService.createLeaveType(dto);
        return new ResponseEntity<>(created, HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    public ResponseEntity<LeaveTypeDTO> updateLeaveType(@PathVariable Long id, @Valid @RequestBody LeaveTypeDTO dto) {
        return ResponseEntity.ok(leaveTypeService.updateLeaveType(id, dto));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    public ResponseEntity<Map<String, String>> deleteLeaveType(@PathVariable Long id) {
        leaveTypeService.deleteLeaveType(id);
        return ResponseEntity.ok(Map.of("message", "Leave type deleted successfully"));
    }
}
