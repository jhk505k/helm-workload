import React from 'react';
import { Card } from './ui/card';
import { motion } from 'framer-motion';

const KPICard = ({ title, value, delta, icon: Icon, deltaType = 'positive', className = '', onClick }) => {
  const deltaColorMap = {
    positive: 'text-status-success',
    warning: 'text-status-warning',
    danger: 'text-status-danger',
    info: 'text-status-info',
  };

  return (
    <motion.div
      whileHover={{ y: -2 }}
      transition={{ duration: 0.16 }}
      className={className}
    >
      <Card 
        className={`p-4 sm:p-6 shadow-sm hover:shadow-md transition-shadow ${onClick ? 'cursor-pointer' : ''}`} 
        onClick={onClick}
        data-testid={`kpi-${title.toLowerCase().replace(/\s+/g, '-')}`}
      >
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <p className="text-xs sm:text-sm text-muted-foreground whitespace-nowrap overflow-hidden text-ellipsis">{title}</p>
            <p className="text-2xl sm:text-3xl font-semibold tracking-tight mt-2 break-words">{value}</p>
            <p className={`text-xs font-medium mt-2 whitespace-nowrap ${deltaColorMap[deltaType]}`}>
              {delta}
            </p>
            <p className="text-xs text-muted-foreground">from last week</p>
          </div>
          <div className="p-2 rounded-lg bg-accent flex-shrink-0">
            <Icon className="w-4 h-4 sm:w-5 sm:h-5 text-foreground/70" />
          </div>
        </div>
      </Card>
    </motion.div>
  );
};

export default KPICard;
