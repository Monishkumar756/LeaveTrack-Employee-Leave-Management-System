import React from 'react';

const StatusBadge = ({ status }) => {
  const getBadgeClass = (s) => {
    switch (s?.toUpperCase()) {
      case 'APPROVED': return 'badge badge-approved';
      case 'PENDING': return 'badge badge-pending';
      case 'REJECTED': return 'badge badge-rejected';
      case 'CANCELLED': return 'badge badge-cancelled';
      default: return 'badge';
    }
  };

  return (
    <span className={getBadgeClass(status)}>
      {status}
    </span>
  );
};

export default StatusBadge;
