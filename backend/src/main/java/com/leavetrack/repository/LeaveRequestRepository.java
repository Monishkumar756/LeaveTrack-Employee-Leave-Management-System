package com.leavetrack.repository;

import com.leavetrack.entity.LeaveRequest;
import com.leavetrack.entity.LeaveStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface LeaveRequestRepository extends JpaRepository<LeaveRequest, Long> {

    List<LeaveRequest> findByEmployeeIdOrderByCreatedAtDesc(Long employeeId);

    List<LeaveRequest> findByEmployeeManagerIdOrderByCreatedAtDesc(Long managerId);

    List<LeaveRequest> findAllByOrderByCreatedAtDesc();

    List<LeaveRequest> findByStatusOrderByCreatedAtDesc(LeaveStatus status);

    @Query("SELECT COUNT(r) > 0 FROM LeaveRequest r WHERE r.employee.id = :employeeId " +
           "AND r.status IN ('PENDING', 'APPROVED') " +
           "AND NOT (r.endDate < :startDate OR r.startDate > :endDate)")
    boolean existsOverlappingRequest(@Param("employeeId") Long employeeId,
                                     @Param("startDate") LocalDate startDate,
                                     @Param("endDate") LocalDate endDate);
}
