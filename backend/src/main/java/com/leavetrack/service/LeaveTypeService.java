package com.leavetrack.service;

import com.leavetrack.dto.LeaveTypeDTO;
import com.leavetrack.entity.LeaveType;
import com.leavetrack.exception.DuplicateResourceException;
import com.leavetrack.exception.ResourceNotFoundException;
import com.leavetrack.repository.LeaveTypeRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class LeaveTypeService {

    @Autowired
    private LeaveTypeRepository leaveTypeRepository;

    public List<LeaveTypeDTO> getAllLeaveTypes() {
        return leaveTypeRepository.findAll().stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    public List<LeaveTypeDTO> getActiveLeaveTypes() {
        return leaveTypeRepository.findByIsActiveTrue().stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    public LeaveTypeDTO getLeaveTypeById(Long id) {
        LeaveType type = leaveTypeRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Leave Type not found with id: " + id));
        return convertToDTO(type);
    }

    @Transactional
    public LeaveTypeDTO createLeaveType(LeaveTypeDTO dto) {
        if (leaveTypeRepository.existsByName(dto.getName())) {
            throw new DuplicateResourceException("Leave type already exists: " + dto.getName());
        }

        LeaveType type = new LeaveType(
                dto.getName(),
                dto.getDescription(),
                dto.getDefaultDays(),
                dto.getCarryForward(),
                dto.getIsActive() != null ? dto.getIsActive() : true
        );

        LeaveType saved = leaveTypeRepository.save(type);
        return convertToDTO(saved);
    }

    @Transactional
    public LeaveTypeDTO updateLeaveType(Long id, LeaveTypeDTO dto) {
        LeaveType type = leaveTypeRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Leave Type not found with id: " + id));

        if (!type.getName().equalsIgnoreCase(dto.getName()) && leaveTypeRepository.existsByName(dto.getName())) {
            throw new DuplicateResourceException("Leave type name already exists: " + dto.getName());
        }

        type.setName(dto.getName());
        type.setDescription(dto.getDescription());
        type.setDefaultDays(dto.getDefaultDays());
        type.setCarryForward(dto.getCarryForward());
        if (dto.getIsActive() != null) {
            type.setIsActive(dto.getIsActive());
        }

        LeaveType updated = leaveTypeRepository.save(type);
        return convertToDTO(updated);
    }

    @Transactional
    public void deleteLeaveType(Long id) {
        LeaveType type = leaveTypeRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Leave Type not found with id: " + id));
        leaveTypeRepository.delete(type);
    }

    public LeaveTypeDTO convertToDTO(LeaveType type) {
        LeaveTypeDTO dto = new LeaveTypeDTO();
        dto.setId(type.getId());
        dto.setName(type.getName());
        dto.setDescription(type.getDescription());
        dto.setDefaultDays(type.getDefaultDays());
        dto.setCarryForward(type.getCarryForward());
        dto.setIsActive(type.getIsActive());
        return dto;
    }
}
