import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight, Plus, AlertTriangle, X } from 'lucide-react';
import { Card } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Input } from '../components/ui/input';
import { Textarea } from '../components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../components/ui/select';

const weekDays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
const timeSlots = Array.from({ length: 12 }, (_, i) => `${i + 8}:00`);

const initialSchedule = [
  { id: 1, day: 'Monday', time: '09:00', duration: 2, title: 'Team Standup', assignee: 'All', type: 'meeting' },
  { id: 2, day: 'Tuesday', time: '10:00', duration: 4, title: 'Client Onboarding - AC', assignee: 'Avery Chen', type: 'task' },
  { id: 3, day: 'Wednesday', time: '14:00', duration: 3, title: 'Budget Review', assignee: 'John Doe', type: 'meeting' },
  { id: 4, day: 'Thursday', time: '09:00', duration: 6, title: 'Payroll Prep - AD/MB', assignee: 'Multiple', type: 'task' },
  { id: 5, day: 'Friday', time: '11:00', duration: 4, title: 'System Migration', assignee: 'John Kim', type: 'task' },
];

const conflicts = [
  { id: 1, message: 'John Kim scheduled for 10 hours on Friday (overtime)', severity: 'warning' },
  { id: 2, message: 'Avery Chen has conflicting meetings on Tuesday 10:00-11:00', severity: 'danger' },
];

const Schedule = () => {
  const [schedule, setSchedule] = useState(() => {
    const saved = localStorage.getItem('scheduleData');
    return saved ? JSON.parse(saved) : initialSchedule;
  });

  // Get current date and calculate week start (Monday)
  const getWeekStart = (date) => {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1); // Adjust when day is Sunday
    return new Date(d.setDate(diff));
  };

  const [currentWeekStart, setCurrentWeekStart] = useState(() => getWeekStart(new Date()));
  const [selectedDay, setSelectedDay] = useState(null);
  const [draggedEvent, setDraggedEvent] = useState(null);
  const [dragOverDay, setDragOverDay] = useState(null);
  const [isAddEventOpen, setIsAddEventOpen] = useState(false);
  const [newEvent, setNewEvent] = useState({
    title: '',
    day: 'Monday',
    time: '09:00',
    duration: 1,
    assignee: '',
    type: 'task'
  });

  // Generate week dates from current week start
  const getWeekDates = () => {
    const dates = [];
    const weekStart = new Date(currentWeekStart);
    for (let i = 0; i < 7; i++) {
      const date = new Date(weekStart);
      date.setDate(weekStart.getDate() + i);
      dates.push(date);
    }
    return dates;
  };

  const weekDates = getWeekDates();

  // Format week range display
  const formatWeekRange = () => {
    const start = weekDates[0];
    const end = weekDates[6];
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    
    const startMonth = monthNames[start.getMonth()];
    const endMonth = monthNames[end.getMonth()];
    const startDate = start.getDate();
    const endDate = end.getDate();
    const year = end.getFullYear();

    if (startMonth === endMonth) {
      return `${startMonth} ${startDate} - ${endDate}, ${year}`;
    } else {
      return `${startMonth} ${startDate} - ${endMonth} ${endDate}, ${year}`;
    }
  };

  // Navigation handlers
  const handlePreviousWeek = () => {
    const newStart = new Date(currentWeekStart);
    newStart.setDate(newStart.getDate() - 7);
    setCurrentWeekStart(newStart);
  };

  const handleNextWeek = () => {
    const newStart = new Date(currentWeekStart);
    newStart.setDate(newStart.getDate() + 7);
    setCurrentWeekStart(newStart);
  };

  const handleToday = () => {
    setCurrentWeekStart(getWeekStart(new Date()));
  };

  useEffect(() => {
    localStorage.setItem('scheduleData', JSON.stringify(schedule));
  }, [schedule]);

  const getEventsByDay = (day) => schedule.filter(event => event.day === day);

  const eventTypeColors = {
    meeting: 'bg-[hsl(var(--primary)/.2)] text-[hsl(var(--primary))] border-l-4 border-[hsl(var(--primary))]',
    task: 'bg-[hsl(var(--secondary)/.2)] text-[hsl(var(--secondary))] border-l-4 border-[hsl(var(--secondary))]',
    leave: 'bg-muted text-foreground border-l-4 border-border',
  };

  // Drag and drop handlers
  const handleDragStart = (e, event) => {
    setDraggedEvent(event);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/html', e.target.innerHTML);
    e.target.style.opacity = '0.5';
  };

  const handleDragEnd = (e) => {
    e.target.style.opacity = '1';
    setDraggedEvent(null);
    setDragOverDay(null);
  };

  const handleDragOver = (e, day) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setDragOverDay(day);
    return false;
  };

  const handleDragEnter = (e, day) => {
    e.preventDefault();
    setDragOverDay(day);
  };

  const handleDragLeave = (e) => {
    setDragOverDay(null);
  };

  const handleDrop = (e, targetDay) => {
    e.preventDefault();
    e.stopPropagation();

    if (draggedEvent && draggedEvent.day !== targetDay) {
      setSchedule(prevSchedule => 
        prevSchedule.map(event => 
          event.id === draggedEvent.id 
            ? { ...event, day: targetDay }
            : event
        )
      );
    }

    setDraggedEvent(null);
    setDragOverDay(null);
    return false;
  };

  const handleAddEvent = () => {
    if (newEvent.title.trim()) {
      const event = {
        id: schedule.length + 1,
        title: newEvent.title,
        day: newEvent.day,
        time: newEvent.time,
        duration: parseInt(newEvent.duration),
        assignee: newEvent.assignee || 'Unassigned',
        type: newEvent.type
      };
      setSchedule([...schedule, event]);
      setIsAddEventOpen(false);
      setNewEvent({
        title: '',
        day: 'Monday',
        time: '09:00',
        duration: 1,
        assignee: '',
        type: 'task'
      });
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.22 }}
      className="space-y-6"
      data-testid="schedule-page"
    >
      <div>
        <h1 className="text-3xl font-semibold tracking-tight">Schedule</h1>
        <p className="text-muted-foreground mt-1">Manage weekly schedules and resolve conflicts</p>
      </div>

      {conflicts.length > 0 && (
        <Card className="p-4 border-[hsl(var(--status-warning))] bg-[hsl(var(--status-warning)/.05)]" data-testid="conflicts-panel">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-status-warning flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <h3 className="text-sm font-semibold mb-2">Scheduling Conflicts Detected</h3>
              <div className="space-y-1">
                {conflicts.map((conflict) => (
                  <p key={conflict.id} className="text-sm text-foreground/80" data-testid={`conflict-${conflict.id}`}>
                    • {conflict.message}
                  </p>
                ))}
              </div>
              <Button size="sm" className="mt-3" data-testid="resolve-conflicts-button">
                Resolve Conflicts
              </Button>
            </div>
          </div>
        </Card>
      )}

      <Card className="p-6 shadow-sm">
        <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" onClick={handlePreviousWeek} data-testid="prev-week-schedule">
              <ChevronLeft className="w-5 h-5" />
            </Button>
            <h3 className="text-base sm:text-lg font-semibold min-w-[200px] text-center">{formatWeekRange()}</h3>
            <Button variant="ghost" size="icon" onClick={handleNextWeek} data-testid="next-week-schedule">
              <ChevronRight className="w-5 h-5" />
            </Button>
            <Button variant="outline" size="sm" onClick={handleToday} data-testid="today-button">
              Today
            </Button>
          </div>
          <Button onClick={() => setIsAddEventOpen(true)} data-testid="add-schedule-button">
            <Plus className="w-4 h-4 mr-2" />
            Add to Schedule
          </Button>
        </div>

        <div className="grid grid-cols-7 gap-3">
          {weekDays.map((day, idx) => {
            const date = weekDates[idx];
            const isToday = new Date().toDateString() === date.toDateString();
            
            return (
              <motion.div
                key={day}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.04, duration: 0.22 }}
                className="min-h-[400px]"
              >
                <div className={`bg-accent rounded-t-lg p-3 border-b border-border ${isToday ? 'bg-primary/10 border-primary' : ''}`}>
                  <h3 className="text-sm font-semibold text-center">{day}</h3>
                  <p className={`text-xs text-center mt-1 ${isToday ? 'text-primary font-semibold' : 'text-muted-foreground'}`}>
                    {date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  </p>
                </div>
              <div 
                className={`bg-card border border-border border-t-0 rounded-b-lg p-2 space-y-2 min-h-[360px] transition-colors ${
                  dragOverDay === day ? 'bg-accent/50 border-primary' : ''
                }`}
                data-testid={`schedule-day-${day.toLowerCase()}`}
                onDragOver={(e) => handleDragOver(e, day)}
                onDragEnter={(e) => handleDragEnter(e, day)}
                onDragLeave={handleDragLeave}
                onDrop={(e) => handleDrop(e, day)}
              >
                {getEventsByDay(day).map((event) => (
                  <motion.div
                    key={event.id}
                    draggable="true"
                    onDragStart={(e) => handleDragStart(e, event)}
                    onDragEnd={handleDragEnd}
                    whileHover={{ scale: 1.02 }}
                    className={`p-2 rounded ${eventTypeColors[event.type]} cursor-move transition-all ${
                      draggedEvent?.id === event.id ? 'opacity-50' : ''
                    }`}
                    data-testid={`schedule-event-${event.id}`}
                  >
                    <div className="text-xs font-mono text-foreground/70 mb-1">{event.time}</div>
                    <div className="text-sm font-medium mb-1">{event.title}</div>
                    <div className="text-xs opacity-80">{event.assignee}</div>
                    <div className="text-xs opacity-70 mt-1">{event.duration}h</div>
                  </motion.div>
                ))}
                {getEventsByDay(day).length === 0 && (
                  <div className="flex items-center justify-center h-full text-muted-foreground text-sm py-8">
                    Drop events here
                  </div>
                )}
              </div>
              </motion.div>
            );
          })}
        </div>
      </Card>

      <div className="grid grid-cols-12 gap-6">
        <Card className="col-span-12 lg:col-span-6 p-6 shadow-sm">
          <h3 className="text-base font-semibold mb-4">Team Availability</h3>
          <div className="space-y-3">
            {['Avery Chen', 'Sarah Mitchell', 'John Kim', 'Lisa Martinez', 'Alex Davis'].map((member, idx) => (
              <motion.div
                key={member}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.04, duration: 0.22 }}
                className="flex items-center justify-between p-3 rounded-md border border-border hover:bg-accent/30 transition-colors"
                data-testid={`availability-${member.toLowerCase().replace(/\s+/g, '-')}`}
              >
                <span className="text-sm font-medium">{member}</span>
                <Badge variant="secondary" className="bg-[hsl(var(--status-success)/.1)] text-[hsl(var(--status-success))] border border-[hsl(var(--status-success)/.2)]">
                  Available
                </Badge>
              </motion.div>
            ))}
          </div>
        </Card>

        <Card className="col-span-12 lg:col-span-6 p-6 shadow-sm">
          <h3 className="text-base font-semibold mb-4">Quick Stats</h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 rounded-lg bg-accent">
              <p className="text-2xl font-semibold">34</p>
              <p className="text-sm text-muted-foreground mt-1">Scheduled Hours</p>
            </div>
            <div className="p-4 rounded-lg bg-accent">
              <p className="text-2xl font-semibold">12</p>
              <p className="text-sm text-muted-foreground mt-1">Team Members</p>
            </div>
            <div className="p-4 rounded-lg bg-accent">
              <p className="text-2xl font-semibold">89%</p>
              <p className="text-sm text-muted-foreground mt-1">Utilization</p>
            </div>
            <div className="p-4 rounded-lg bg-accent">
              <p className="text-2xl font-semibold">2</p>
              <p className="text-sm text-muted-foreground mt-1">Conflicts</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Add Event Dialog */}
      <Dialog open={isAddEventOpen} onOpenChange={setIsAddEventOpen}>
        <DialogContent className="max-w-2xl" data-testid="add-event-dialog">
          <DialogHeader>
            <DialogTitle>Add Event to Schedule</DialogTitle>
            <DialogDescription>
              Create a new event, meeting, or task in the weekly schedule
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {/* Event Title */}
            <div>
              <label className="text-sm font-semibold mb-2 block">Event Title *</label>
              <Input
                value={newEvent.title}
                onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })}
                placeholder="e.g., Team Meeting, Client Call"
                data-testid="new-event-title"
              />
            </div>

            {/* Day and Time */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-semibold mb-2 block">Day</label>
                <Select value={newEvent.day} onValueChange={(value) => setNewEvent({ ...newEvent, day: value })}>
                  <SelectTrigger className="bg-background" data-testid="new-event-day">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-background">
                    {weekDays.map(day => (
                      <SelectItem key={day} value={day}>{day}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-semibold mb-2 block">Time</label>
                <Select value={newEvent.time} onValueChange={(value) => setNewEvent({ ...newEvent, time: value })}>
                  <SelectTrigger className="bg-background" data-testid="new-event-time">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-background">
                    {timeSlots.map(time => (
                      <SelectItem key={time} value={time}>{time}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Duration and Type */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-semibold mb-2 block">Duration (hours)</label>
                <Input
                  type="number"
                  min="1"
                  max="8"
                  value={newEvent.duration}
                  onChange={(e) => setNewEvent({ ...newEvent, duration: parseInt(e.target.value) || 1 })}
                  data-testid="new-event-duration"
                />
              </div>
              <div>
                <label className="text-sm font-semibold mb-2 block">Type</label>
                <Select value={newEvent.type} onValueChange={(value) => setNewEvent({ ...newEvent, type: value })}>
                  <SelectTrigger className="bg-background" data-testid="new-event-type">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-background">
                    <SelectItem value="meeting">Meeting</SelectItem>
                    <SelectItem value="task">Task</SelectItem>
                    <SelectItem value="leave">Leave</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Assignee */}
            <div>
              <label className="text-sm font-semibold mb-2 block">Assignee</label>
              <Input
                value={newEvent.assignee}
                onChange={(e) => setNewEvent({ ...newEvent, assignee: e.target.value })}
                placeholder="e.g., John Doe, All, Multiple"
                data-testid="new-event-assignee"
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddEventOpen(false)} data-testid="cancel-add-event">
              <X className="w-4 h-4 mr-2" />
              Cancel
            </Button>
            <Button onClick={handleAddEvent} disabled={!newEvent.title.trim()} data-testid="confirm-add-event">
              <Plus className="w-4 h-4 mr-2" />
              Add Event
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </motion.div>
  );
};

export default Schedule;
