import React from 'react';

const StatusBadge = ({ status }) => (
  <span className={`badge ${status}`}>
    {status === 'PLACED' && '●'}
    {status === 'PREPARING' && '●'}
    {status === 'OUT_FOR_DELIVERY' && '●'}
    {status === 'COMPLETED' && '✓'}
    {status === 'CANCELLED' && '✕'}
    {' '}{status?.replace(/_/g, ' ')}
  </span>
);

export default StatusBadge;
