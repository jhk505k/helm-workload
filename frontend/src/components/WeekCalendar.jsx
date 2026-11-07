import React, { useState, useEffect } from 'react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { ChevronLeft, ChevronRight, Plus } from 'lucide-react';
import { motion } from 'framer-motion';

const initialEvents = [
  { id: 1, day: 'Mon', time: '09:00', title: 'Team standup', type: 'default' },
  { id: 2, day: 'Tue', time: '10:00', title: 'Client onboarding - AC', type: 'default' },
  { id: 3, day: 'Wed', time: '14:00', title: 'Budget review', type: 'default' },
  { id: 4, day: 'Thu', time: '09:00', title: 'Payroll prep - AD/MB', type: 'default' },
  { id: 5, day: 'Fri', time: '11:00', title: 'System migration', type: 'overtime' },
];

const weekDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'];

const WeekCalendar = () => {
  const [events, setEvents] = useState(() => {
    const saved = localStorage.getItem('calendarEvents');
    return saved ? JSON.parse(saved) : initialEvents;
  });

  const [currentWeek, setCurrentWeek] = useState('Jan 13 - Jan 17, 2025');

  useEffect(() => {
    localStorage.setItem('calendarEvents', JSON.stringify(events));
  }, [events]);

  const eventStyles = {
    default: 'rounded-sm bg-[hsl(var(--primary)/.1)] text-[hsl(var(--primary))] border border-[hsl(var(--primary)/.2)] px-1.5 py-0.5',
    overtime: 'rounded-sm bg-[hsl(var(--status-warning)/.1)] text-[hsl(var(--status-warning))] border border-[hsl(var(--status-warning)/.2)] px-1.5 py-0.5',
    leave: 'rounded-sm bg-muted text-foreground px-1.5 py-0.5 border border-border',
  };

  const getEventsByDay = (day) => events.filter(event => event.day === day);

  return (
    <Card className="p-4 shadow-sm" data-testid="week-calendar">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-base font-semibold">Schedule (Week)</h2>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" className="h-8 w-8" data-testid="prev-week">
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <span className="text-xs text-muted-foreground px-2">{currentWeek}</span>
          <Button variant="ghost" size="icon" className="h-8 w-8" data-testid="next-week">
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      </div>

      <div className="border-t border-border">
        {weekDays.map((day, idx) => (
          <motion.div
            key={day}
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: idx * 0.04, duration: 0.22 }}
            className="border-b last:border-b-0 border-border py-3"
            data-testid={`calendar-day-${day.toLowerCase()}`}
          >
            <div className="flex items-start gap-3">
              <div className="w-12 flex-shrink-0">
                <span className="text-sm font-medium">{day}</span>
              </div>
              <div className="flex-1 space-y-1">
                {getEventsByDay(day).length > 0 ? (
                  getEventsByDay(day).map((event) => (
                    <div
                      key={event.id}
                      className={`text-xs ${eventStyles[event.type]} inline-flex items-center gap-1`}
                      data-testid={`event-${event.id}`}
                    >
                      <span className="font-mono">{event.time}</span>
                      <span>{event.title}</span>
                    </div>
                  ))
                ) : (
                  <span className="text-xs text-muted-foreground">No events</span>
                )}
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="mt-4 pt-4 border-t border-border">
        <Button variant="outline" size="sm" className="w-full" data-testid="add-event-button">
          <Plus className="w-4 h-4 mr-2" />
          Add Event
        </Button>
      </div>
    </Card>
  );
};

export default WeekCalendar;
