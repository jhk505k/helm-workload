import React, { useState, useEffect } from 'react';
import { Card } from './ui/card';
import { Clock, UserPlus, CheckCircle, AlertCircle, Calendar } from 'lucide-react';
import { motion } from 'framer-motion';

const activityIcons = {
  assign: UserPlus,
  complete: CheckCircle,
  conflict: AlertCircle,
  schedule: Calendar,
  general: Clock,
};

const initialActivities = [
  {
    id: 1,
    type: 'assign',
    message: 'Avery Chen assigned to "Client Onboarding"',
    time: '2 minutes ago',
  },
  {
    id: 2,
    type: 'complete',
    message: 'Sarah Mitchell completed "Employee Survey"',
    time: '15 minutes ago',
  },
  {
    id: 3,
    type: 'conflict',
    message: 'Scheduling conflict detected for John Kim',
    time: '1 hour ago',
  },
  {
    id: 4,
    type: 'schedule',
    message: 'Q4 Budget Review scheduled for Wed 14:00',
    time: '2 hours ago',
  },
  {
    id: 5,
    type: 'assign',
    message: 'Lisa Martinez assigned to "System Migration"',
    time: '3 hours ago',
  },
];

const ActivityFeed = () => {
  const [activities, setActivities] = useState(() => {
    const saved = localStorage.getItem('activityFeed');
    return saved ? JSON.parse(saved) : initialActivities;
  });

  useEffect(() => {
    localStorage.setItem('activityFeed', JSON.stringify(activities));
  }, [activities]);

  return (
    <Card className="p-6 shadow-sm" data-testid="activity-feed">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-base font-semibold">Recent Activity</h2>
      </div>

      <div className="space-y-1">
        {activities.map((activity, idx) => {
          const IconComponent = activityIcons[activity.type] || activityIcons.general;
          return (
            <motion.div
              key={activity.id}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.04, duration: 0.22 }}
              className="py-3 border-b last:border-b-0 border-border/60 hover:bg-accent/30 rounded px-2 -mx-2 transition-colors"
              data-testid={`activity-${activity.id}`}
            >
              <div className="flex items-start gap-3">
                <div className="p-1.5 rounded-full bg-accent mt-0.5">
                  <IconComponent className="w-3.5 h-3.5 text-foreground/70" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm">{activity.message}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{activity.time}</p>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </Card>
  );
};

export default ActivityFeed;
