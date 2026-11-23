package com.leavetrack.service;

import com.leavetrack.dto.LeaveActionRequest;
import com.leavetrack.dto.LeaveApplicationRequest;
import com.leavetrack.dto.LeaveRequestDTO;
import com.leavetrack.entity.*;
import com.leavetrack.exception.BadRequestException;
import com.leavetrack.exception.ResourceNotFoundException;
import com.leavetrack.repository.EmployeeRepository;
import com.leavetrack.repository.LeaveBalanceRepository;
import com.leavetrack.repository.LeaveRequestRepository;
import com.leavetrack.repository.LeaveTypeRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class LeaveRequestService {

    @Autowired
    private LeaveRequestRepository leaveRequestRepository;

    @Autowired
    private EmployeeRepository employeeRepository;

    @Autowired
    private LeaveTypeRepository leaveTypeRepository;

    @Autowired
    private LeaveBalanceRepository leaveBalanceRepository;

    @Transactional
    public LeaveRequestDTO applyLeave(Long employeeId, LeaveApplicationRequest request) {
        Employee employee = employeeRepository.findById(employeeId)
                .orElseThrow(() -> new ResourceNotFoundException("Employee not found with id: " + employeeId));

        LeaveType leaveType = leaveTypeRepository.findById(request.getLeaveTypeId())
                .orElseThrow(() -> new ResourceNotFoundException("Leave Type not found with id: " + request.getLeaveTypeId()));

        if (!leaveType.getIsActive()) {
            throw new BadRequestException("Selected leave type is currently disabled.");
        }

        // Rule 2: Start date cannot be after end date
        if (request.getStartDate().isAfter(request.getEndDate())) {
            throw new BadRequestException("Leave start date cannot be after end date.");
        }

        // Rule 3: Past-date handling - Start date cannot be before today
        if (request.getStartDate().isBefore(LocalDate.now())) {
            throw new BadRequestException("Leave cannot be applied for past dates.");
        }

        // Rule 4: Check for overlapping leave requests
        boolean hasOverlap = leaveRequestRepository.existsOverlappingRequest(
                employee.getId(),
                request.getStartDate(),
                request.getEndDate()
        );
        if (hasOverlap) {
            throw new BadRequestException("You already have a pending or approved leave overlapping with these dates.");
        }

        // Calculate business days (excluding weekends for standard enterprise leave calculation)
        int totalDays = calculateWorkingDays(request.getStartDate(), request.getEndDate());
        if (totalDays <= 0) {
            throw new BadRequestException("Selected date range does not contain any valid working days.");
        }

        // Rule 5: Cannot exceed available leave balance
        int currentYear = request.getStartDate().getYear();
        LeaveBalance balance = leaveBalanceRepository
                .findByEmployeeIdAndLeaveTypeIdAndYear(employee.getId(), leaveType.getId(), currentYear)
                .orElseThrow(() -> new BadRequestException("No leave balance record found for " + leaveType.getName() + " in year " + currentYear));

        if (totalDays > balance.getRemainingDays()) {
            throw new BadRequestException(String.format(
                    "Insufficient leave balance for %s. Requested: %d days, Available: %d days.",
                    leaveType.getName(), totalDays, balance.getRemainingDays()
            ));
        }

        LeaveRequest leaveRequest = new LeaveRequest(
                employee,
                leaveType,
                request.getStartDate(),
                request.getEndDate(),
                totalDays,
                request.getReason()
        );

        LeaveRequest saved = leaveRequestRepository.save(leaveRequest);
        return convertToDTO(saved);
    }

    public List<LeaveRequestDTO> getEmployeeLeaves(Long employeeId) {
        return leaveRequestRepository.findByEmployeeIdOrderByCreatedAtDesc(employeeId).stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    public List<LeaveRequestDTO> getManagerPendingLeaves(Long managerId) {
        return leaveRequestRepository.findByEmployeeManagerIdOrderByCreatedAtDesc(managerId).stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    public List<LeaveRequestDTO> getAllLeaves() {
        return leaveRequestRepository.findAllByOrderByCreatedAtDesc().stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    @Transactional
    public LeaveRequestDTO reviewLeave(Long requestId, Long reviewerId, LeaveActionRequest actionRequest) {
        LeaveRequest leaveRequest = leaveRequestRepository.findById(requestId)
                .orElseThrow(() -> new ResourceNotFoundException("Leave request not found with id: " + requestId));

        Employee reviewer = employeeRepository.findById(reviewerId)
                .orElseThrow(() -> new ResourceNotFoundException("Reviewer not found with id: " + reviewerId));

        // Rule 9: Prevent duplicate processing of the same request
        if (leaveRequest.getStatus() != LeaveStatus.PENDING) {
            throw new BadRequestException("This leave request has already been processed with status: " + leaveRequest.getStatus());
        }

        if (actionRequest.getStatus() != LeaveStatus.APPROVED && actionRequest.getStatus() != LeaveStatus.REJECTED) {
            throw new BadRequestException("Action must be either APPROVED or REJECTED.");
        }

        // Rule 7 & 8: Update leave balance on approval, do NOT reduce on rejection
        if (actionRequest.getStatus() == LeaveStatus.APPROVED) {
            int year = leaveRequest.getStartDate().getYear();
            LeaveBalance balance = leaveBalanceRepository
                    .findByEmployeeIdAndLeaveTypeIdAndYear(leaveRequest.getEmployee().getId(), leaveRequest.getLeaveType().getId(), year)
                    .orElseThrow(() -> new BadRequestException("Employee leave balance not found for year " + year));

            if (leaveRequest.getTotalDays() > balance.getRemainingDays()) {
                throw new BadRequestException("Cannot approve: Employee now has insufficient remaining balance (" + balance.getRemainingDays() + " days remaining).");
            }

            balance.setUsedDays(balance.getUsedDays() + leaveRequest.getTotalDays());
            balance.setRemainingDays(balance.getRemainingDays() - leaveRequest.getTotalDays());
            leaveBalanceRepository.save(balance);
        }

        leaveRequest.setStatus(actionRequest.getStatus());
        leaveRequest.setManagerComment(actionRequest.getComment());
        leaveRequest.setReviewedBy(reviewer);
        leaveRequest.setReviewedAt(LocalDateTime.now());

        LeaveRequest updated = leaveRequestRepository.save(leaveRequest);
        return convertToDTO(updated);
    }

    @Transactional
    public LeaveRequestDTO cancelLeave(Long requestId, Long employeeId) {
        LeaveRequest leaveRequest = leaveRequestRepository.findById(requestId)
                .orElseThrow(() -> new ResourceNotFoundException("Leave request not found with id: " + requestId));

        if (!leaveRequest.getEmployee().getId().equals(employeeId)) {
            throw new BadRequestException("You are not authorized to cancel this leave request.");
        }

        if (leaveRequest.getStatus() != LeaveStatus.PENDING) {
            throw new BadRequestException("Only PENDING leave requests can be cancelled.");
        }

        leaveRequest.setStatus(LeaveStatus.CANCELLED);
        LeaveRequest updated = leaveRequestRepository.save(leaveRequest);
        return convertToDTO(updated);
    }

    /**
     * Calculates working days between two dates inclusive (skips Saturday and Sunday).
     */
    private int calculateWorkingDays(LocalDate start, LocalDate end) {
        int workDays = 0;
        LocalDate date = start;
        while (!date.isAfter(end)) {
            if (date.getDayOfWeek() != DayOfWeek.SATURDAY && date.getDayOfWeek() != DayOfWeek.SUNDAY) {
                workDays++;
            }
            date = date.plusDays(1);
        }
        return workDays;
    }

    public LeaveRequestDTO convertToDTO(LeaveRequest req) {
        LeaveRequestDTO dto = new LeaveRequestDTO();
        dto.setId(req.getId());
        dto.setEmployeeId(req.getEmployee().getId());
        dto.setEmployeeCode(req.getEmployee().getEmployeeId());
        dto.setEmployeeName(req.getEmployee().getFullName());
        dto.setEmployeeEmail(req.getEmployee().getEmail());
        dto.setDepartment(req.getEmployee().getDepartment());
        dto.setLeaveTypeId(req.getLeaveType().getId());
        dto.setLeaveTypeName(req.getLeaveType().getName());
        dto.setStartDate(req.getStartDate());
        dto.setEndDate(req.getEndDate());
        dto.setTotalDays(req.getTotalDays());
        dto.setReason(req.getReason());
        dto.setStatus(req.getStatus());
        dto.setManagerComment(req.getManagerComment());
        if (req.getReviewedBy() != null) {
            dto.setReviewedByName(req.getReviewedBy().getFullName());
        }
        dto.setReviewedAt(req.getReviewedAt());
        dto.setCreatedAt(req.getCreatedAt());
        return dto;
    }
}
