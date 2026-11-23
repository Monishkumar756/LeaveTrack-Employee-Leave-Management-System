package com.leavetrack.service;

import com.leavetrack.dto.LeaveBalanceDTO;
import com.leavetrack.entity.Employee;
import com.leavetrack.entity.LeaveBalance;
import com.leavetrack.entity.LeaveType;
import com.leavetrack.exception.ResourceNotFoundException;
import com.leavetrack.repository.LeaveBalanceRepository;
import com.leavetrack.repository.LeaveTypeRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class LeaveBalanceService {

    @Autowired
    private LeaveBalanceRepository leaveBalanceRepository;

    @Autowired
    private LeaveTypeRepository leaveTypeRepository;

    public List<LeaveBalanceDTO> getBalancesByEmployee(Long employeeId, Integer year) {
        int targetYear = (year != null) ? year : LocalDate.now().getYear();
        return leaveBalanceRepository.findByEmployeeIdAndYear(employeeId, targetYear).stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    @Transactional
    public void initializeBalancesForEmployee(Employee employee, int year) {
        List<LeaveType> activeTypes = leaveTypeRepository.findByIsActiveTrue();
        for (LeaveType type : activeTypes) {
            boolean exists = leaveBalanceRepository
                    .findByEmployeeIdAndLeaveTypeIdAndYear(employee.getId(), type.getId(), year)
                    .isPresent();

            if (!exists) {
                LeaveBalance balance = new LeaveBalance(
                        employee,
                        type,
                        year,
                        type.getDefaultDays(),
                        0,
                        type.getDefaultDays()
                );
                leaveBalanceRepository.save(balance);
            }
        }
    }

    @Transactional
    public LeaveBalanceDTO updateBalanceQuota(Long id, int totalDays) {
        LeaveBalance balance = leaveBalanceRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Leave Balance not found with id: " + id));

        balance.setTotalDays(totalDays);
        balance.setRemainingDays(totalDays - balance.getUsedDays());
        LeaveBalance updated = leaveBalanceRepository.save(balance);
        return convertToDTO(updated);
    }

    public LeaveBalanceDTO convertToDTO(LeaveBalance balance) {
        return new LeaveBalanceDTO(
                balance.getId(),
                balance.getEmployee().getId(),
                balance.getEmployee().getFullName(),
                balance.getLeaveType().getId(),
                balance.getLeaveType().getName(),
                balance.getYear(),
                balance.getTotalDays(),
                balance.getUsedDays(),
                balance.getRemainingDays()
        );
    }
}
