import React, { useState, useEffect } from 'react';
import { Card } from './ui/card';
import { motion } from 'framer-motion';

const initialCapacityData = [
  { name: 'Avery Chen', mon: 8, tue: 6, wed: 8, thu: 8, fri: 4, status: 'ok' },
  { name: 'Sarah Mitchell', mon: 8, tue: 8, wed: 2, thu: 6, fri: 8, status: 'under' },
  { name: 'John Kim', mon: 10, tue: 9, wed: 8, thu: 8, fri: 10, status: 'over' },
  { name: 'Lisa Martinez', mon: 8, tue: 8, wed: 8, thu: 8, fri: 8, status: 'ok' },
  { name: 'Alex Davis', mon: 6, tue: 8, wed: 8, thu: 8, fri: 6, status: 'under' },
];

const TeamCapacity = () => {
  const [capacityData, setCapacityData] = useState(() => {
    const saved = localStorage.getItem('teamCapacity');
    return saved ? JSON.parse(saved) : initialCapacityData;
  });

  useEffect(() => {
    localStorage.setItem('teamCapacity', JSON.stringify(capacityData));
  }, [capacityData]);

  const getHourColor = (hours) => {
    if (hours >= 9) return 'bg-[hsl(var(--status-warning)/.3)]';
    if (hours >= 7) return 'bg-[hsl(var(--primary)/.4)]';
    if (hours >= 5) return 'bg-[hsl(var(--primary)/.2)]';
    return 'bg-[hsl(var(--muted))]';
  };

  const statusColors = {
    ok: 'text-status-success',
    under: 'text-status-info',
    over: 'text-status-warning',
  };

  return (
    <Card className="p-6 shadow-sm" data-testid="team-capacity">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-base font-semibold">Team Capacity (This Week)</h2>
        <div className="flex items-center gap-3 text-xs text-muted-foreground">
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded bg-[hsl(var(--muted))]" />
            <span>&lt;5h</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded bg-[hsl(var(--primary)/.2)]" />
            <span>5-7h</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded bg-[hsl(var(--primary)/.4)]" />
            <span>7-9h</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded bg-[hsl(var(--status-warning)/.3)]" />
            <span>&gt;9h</span>
          </div>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border">
              <th className="text-left py-2 pr-4 font-medium text-muted-foreground">Team Member</th>
              <th className="text-center py-2 px-2 font-medium text-muted-foreground">Mon</th>
              <th className="text-center py-2 px-2 font-medium text-muted-foreground">Tue</th>
              <th className="text-center py-2 px-2 font-medium text-muted-foreground">Wed</th>
              <th className="text-center py-2 px-2 font-medium text-muted-foreground">Thu</th>
              <th className="text-center py-2 px-2 font-medium text-muted-foreground">Fri</th>
              <th className="text-right py-2 pl-4 font-medium text-muted-foreground">Status</th>
            </tr>
          </thead>
          <tbody>
            {capacityData.map((member, idx) => (
              <motion.tr
                key={member.name}
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.04, duration: 0.22 }}
                className="border-b last:border-b-0 border-border hover:bg-accent/30 transition-colors"
                data-testid={`capacity-row-${member.name.toLowerCase().replace(/\s+/g, '-')}`}
              >
                <td className="py-3 pr-4 font-medium">{member.name}</td>
                <td className="py-3 px-2 text-center">
                  <div className={`w-10 h-8 mx-auto rounded ${getHourColor(member.mon)} flex items-center justify-center text-xs font-medium`}>
                    {member.mon}h
                  </div>
                </td>
                <td className="py-3 px-2 text-center">
                  <div className={`w-10 h-8 mx-auto rounded ${getHourColor(member.tue)} flex items-center justify-center text-xs font-medium`}>
                    {member.tue}h
                  </div>
                </td>
                <td className="py-3 px-2 text-center">
                  <div className={`w-10 h-8 mx-auto rounded ${getHourColor(member.wed)} flex items-center justify-center text-xs font-medium`}>
                    {member.wed}h
                  </div>
                </td>
                <td className="py-3 px-2 text-center">
                  <div className={`w-10 h-8 mx-auto rounded ${getHourColor(member.thu)} flex items-center justify-center text-xs font-medium`}>
                    {member.thu}h
                  </div>
                </td>
                <td className="py-3 px-2 text-center">
                  <div className={`w-10 h-8 mx-auto rounded ${getHourColor(member.fri)} flex items-center justify-center text-xs font-medium`}>
                    {member.fri}h
                  </div>
                </td>
                <td className="py-3 pl-4 text-right">
                  <span className={`text-xs font-medium ${statusColors[member.status]}`}>
                    {member.status === 'ok' ? '✓ OK' : member.status === 'under' ? '↓ Under' : '↑ Over'}
                  </span>
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
};

export default TeamCapacity;
