import React, { useState, useEffect } from 'react';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { Avatar, AvatarFallback } from './ui/avatar';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { motion } from 'framer-motion';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from './ui/dialog';
import { 
  Calendar, 
  Clock, 
  Users, 
  Building2, 
  AlertCircle, 
  CheckCircle2, 
  ArrowRight,
  Edit,
  Trash2,
  X
} from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select';
import { Checkbox } from './ui/checkbox';

const initialTasks = [
  {
    id: 1,
    title: 'Prepare payroll variance report',
    status: 'todo',
    priority: 'high',
    dueDate: 'Thu',
    dueDateFull: 'January 16, 2025',
    assignees: ['AD', 'MB'],
    assigneeNames: ['Alex Davis', 'Maria Brown'],
    department: 'Finance',
    description: 'Analyze payroll discrepancies between forecasted and actual costs for Q4. Include breakdown by department and employee category.',
    estimatedHours: 8,
    skills: ['Financial Analysis', 'Excel', 'Payroll Systems'],
    createdBy: 'Sarah Mitchell',
    createdDate: 'Jan 10, 2025'
  },
  {
    id: 2,
    title: 'Client onboarding session',
    status: 'todo',
    priority: 'medium',
    dueDate: 'Tue',
    dueDateFull: 'January 14, 2025',
    assignees: ['AC'],
    assigneeNames: ['Avery Chen'],
    department: 'Sales',
    description: 'Conduct comprehensive onboarding session for new enterprise client. Cover product features, implementation timeline, and support resources.',
    estimatedHours: 4,
    skills: ['Client Relations', 'Product Knowledge', 'Presentation'],
    createdBy: 'John Kim',
    createdDate: 'Jan 8, 2025'
  },
  {
    id: 3,
    title: 'System migration phase 2',
    status: 'inprogress',
    priority: 'high',
    dueDate: 'Fri',
    dueDateFull: 'January 17, 2025',
    assignees: ['JK', 'LM', 'PQ'],
    assigneeNames: ['John Kim', 'Lisa Martinez', 'Paul Quinn'],
    department: 'IT',
    description: 'Migrate customer database and API endpoints to new cloud infrastructure. Includes testing, validation, and rollback planning.',
    estimatedHours: 16,
    skills: ['DevOps', 'Cloud Architecture', 'Database Management'],
    createdBy: 'Tech Lead',
    createdDate: 'Jan 5, 2025',
    progressNotes: 'Phase 1 completed. Currently working on database migration.'
  },
  {
    id: 4,
    title: 'Employee satisfaction survey',
    status: 'inprogress',
    priority: 'low',
    dueDate: 'Mon',
    dueDateFull: 'January 20, 2025',
    assignees: ['SM'],
    assigneeNames: ['Sarah Mitchell'],
    department: 'HR',
    description: 'Design and distribute quarterly employee satisfaction survey. Analyze results and prepare summary report for leadership.',
    estimatedHours: 6,
    skills: ['Survey Design', 'Data Analysis', 'HR Policy'],
    createdBy: 'HR Director',
    createdDate: 'Jan 6, 2025',
    progressNotes: 'Survey questions drafted and approved. Ready for distribution.'
  },
  {
    id: 5,
    title: 'Q4 budget review meeting',
    status: 'blocked',
    priority: 'high',
    dueDate: 'Wed',
    dueDateFull: 'January 15, 2025',
    assignees: ['JD'],
    assigneeNames: ['John Doe'],
    department: 'Finance',
    description: 'Facilitate quarterly budget review with department heads. Present variance analysis and discuss budget adjustments for next quarter.',
    estimatedHours: 3,
    skills: ['Budget Planning', 'Financial Reporting', 'Leadership'],
    createdBy: 'CFO',
    createdDate: 'Jan 7, 2025',
    blockedReason: 'Waiting for final Q4 numbers from accounting team'
  },
];

const columns = [
  { id: 'todo', title: 'To Do', color: 'border-muted' },
  { id: 'inprogress', title: 'In Progress', color: 'border-status-info' },
  { id: 'blocked', title: 'Blocked', color: 'border-status-warning' },
];

// Available team members with availability status and departments
const availableTeamMembers = [
  { id: 'AD', name: 'Alex Davis', initials: 'AD', availability: 'available', hours: 35, department: 'Finance' },
  { id: 'MB', name: 'Maria Brown', initials: 'MB', availability: 'available', hours: 38, department: 'Finance' },
  { id: 'AC', name: 'Avery Chen', initials: 'AC', availability: 'available', hours: 36, department: 'Sales' },
  { id: 'JK', name: 'John Kim', initials: 'JK', availability: 'busy', hours: 42, department: 'IT' },
  { id: 'LM', name: 'Lisa Martinez', initials: 'LM', availability: 'available', hours: 32, department: 'IT' },
  { id: 'PQ', name: 'Paul Quinn', initials: 'PQ', availability: 'available', hours: 40, department: 'IT' },
  { id: 'SM', name: 'Sarah Mitchell', initials: 'SM', availability: 'busy', hours: 41, department: 'HR' },
  { id: 'JD', name: 'John Doe', initials: 'JD', availability: 'available', hours: 37, department: 'Finance' },
];

const KanbanBoard = () => {
  const [tasks, setTasks] = useState(() => {
    const saved = localStorage.getItem('kanbanTasks');
    return saved ? JSON.parse(saved) : initialTasks;
  });

  const [draggedTask, setDraggedTask] = useState(null);
  const [dragOverColumn, setDragOverColumn] = useState(null);
  const [selectedTask, setSelectedTask] = useState(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editedTask, setEditedTask] = useState(null);

  useEffect(() => {
    localStorage.setItem('kanbanTasks', JSON.stringify(tasks));
  }, [tasks]);

  const getTasksByStatus = (status) => tasks.filter(task => task.status === status);

  const priorityStyles = {
    low: 'bg-muted text-foreground',
    medium: 'bg-[hsl(var(--status-info)/.1)] text-[hsl(var(--status-info))] border border-[hsl(var(--status-info)/.2)]',
    high: 'bg-[hsl(var(--status-danger)/.1)] text-[hsl(var(--status-danger))] border border-[hsl(var(--status-danger)/.2)]',
  };

  const statusStyles = {
    todo: { bg: 'bg-muted', text: 'text-foreground', label: 'To Do' },
    inprogress: { bg: 'bg-status-info/10', text: 'text-status-info', label: 'In Progress' },
    blocked: { bg: 'bg-status-warning/10', text: 'text-status-warning', label: 'Blocked' },
    completed: { bg: 'bg-status-success/10', text: 'text-status-success', label: 'Completed' },
  };

  const handleTaskClick = (task) => {
    setSelectedTask(task);
    setEditedTask({ ...task });
    setIsEditMode(false);
    setIsDialogOpen(true);
  };

  const handleStatusChange = (newStatus) => {
    if (selectedTask) {
      setTasks(prevTasks =>
        prevTasks.map(task =>
          task.id === selectedTask.id ? { ...task, status: newStatus } : task
        )
      );
      setSelectedTask({ ...selectedTask, status: newStatus });
      setEditedTask({ ...selectedTask, status: newStatus });
    }
  };

  const handleDeleteTask = () => {
    if (selectedTask) {
      setTasks(prevTasks => prevTasks.filter(task => task.id !== selectedTask.id));
      setIsDialogOpen(false);
      setSelectedTask(null);
      setEditedTask(null);
    }
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setSelectedTask(null);
    setEditedTask(null);
    setIsEditMode(false);
  };

  const handleEditClick = () => {
    setIsEditMode(true);
  };

  const handleCancelEdit = () => {
    setEditedTask({ ...selectedTask });
    setIsEditMode(false);
  };

  const handleSaveEdit = () => {
    if (editedTask) {
      setTasks(prevTasks =>
        prevTasks.map(task =>
          task.id === editedTask.id ? editedTask : task
        )
      );
      setSelectedTask(editedTask);
      setIsEditMode(false);
    }
  };

  const handleFieldChange = (field, value) => {
    if (field === 'department') {
      // Clear assignees when department changes
      setEditedTask(prev => ({ ...prev, [field]: value, assignees: [], assigneeNames: [] }));
    } else {
      setEditedTask(prev => ({ ...prev, [field]: value }));
    }
  };

  // Filter team members by task department
  const filteredTeamMembers = editedTask?.department 
    ? availableTeamMembers.filter(member => member.department === editedTask.department)
    : availableTeamMembers;

  const handleSkillsChange = (skillsString) => {
    const skillsArray = skillsString.split(',').map(s => s.trim()).filter(s => s);
    setEditedTask(prev => ({ ...prev, skills: skillsArray }));
  };

  const handleAssigneeToggle = (memberId, memberName, memberInitials) => {
    setEditedTask(prev => {
      const currentAssignees = prev.assignees || [];
      const currentNames = prev.assigneeNames || [];
      const isCurrentlyAssigned = currentAssignees.includes(memberInitials);

      if (isCurrentlyAssigned) {
        return {
          ...prev,
          assignees: currentAssignees.filter(a => a !== memberInitials),
          assigneeNames: currentNames.filter(n => n !== memberName)
        };
      } else {
        return {
          ...prev,
          assignees: [...currentAssignees, memberInitials],
          assigneeNames: [...currentNames, memberName]
        };
      }
    });
  };

  // Drag and drop handlers
  const handleDragStart = (e, task) => {
    setDraggedTask(task);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/html', e.target.innerHTML);
  };

  const handleDragEnd = () => {
    setDraggedTask(null);
    setDragOverColumn(null);
  };

  const handleDragOver = (e, columnId) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setDragOverColumn(columnId);
    return false;
  };

  const handleDragEnter = (e, columnId) => {
    e.preventDefault();
    setDragOverColumn(columnId);
  };

  const handleDragLeave = () => {
    setDragOverColumn(null);
  };

  const handleDrop = (e, targetStatus) => {
    e.preventDefault();
    e.stopPropagation();

    if (draggedTask && draggedTask.status !== targetStatus) {
      setTasks(prevTasks =>
        prevTasks.map(task =>
          task.id === draggedTask.id
            ? { ...task, status: targetStatus }
            : task
        )
      );
    }

    setDraggedTask(null);
    setDragOverColumn(null);
    return false;
  };

  return (
    <>
      <Card className="p-6 shadow-sm" data-testid="kanban-board">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-base font-semibold">Assignments</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {columns.map((column) => {
          const columnTasks = getTasksByStatus(column.id);
          return (
            <div
              key={column.id}
              className={`bg-background rounded-lg border ${column.color} p-3 transition-colors ${
                dragOverColumn === column.id ? 'bg-accent/50 border-primary border-2' : ''
              }`}
              data-testid={`kanban-column-${column.id}`}
              onDragOver={(e) => handleDragOver(e, column.id)}
              onDragEnter={(e) => handleDragEnter(e, column.id)}
              onDragLeave={handleDragLeave}
              onDrop={(e) => handleDrop(e, column.id)}
            >
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-medium">{column.title}</h3>
                <span className="text-xs text-muted-foreground">{columnTasks.length}</span>
              </div>

              <div className="space-y-2 min-h-[200px]">
                {columnTasks.map((task, idx) => (
                  <motion.div
                    key={task.id}
                    draggable="true"
                    onDragStart={(e) => handleDragStart(e, task)}
                    onDragEnd={handleDragEnd}
                    onClick={() => handleTaskClick(task)}
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.04, duration: 0.22 }}
                    whileHover={{ scale: 1.02, boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }}
                    className={`bg-card border border-border rounded-md p-3 shadow-xs cursor-pointer transition-all ${
                      draggedTask?.id === task.id ? 'opacity-50' : ''
                    }`}
                    data-testid={`task-card-${task.id}`}
                  >
                    <h4 className="text-sm font-medium mb-2">{task.title}</h4>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground mb-3">
                      <span>Due {task.dueDate}</span>
                      <span>•</span>
                      <span>{task.department}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex -space-x-1">
                        {task.assignees.map((assignee, i) => (
                          <Avatar key={i} className="w-6 h-6 border-2 border-card">
                            <AvatarFallback className="text-xs bg-primary text-primary-foreground">
                              {assignee}
                            </AvatarFallback>
                          </Avatar>
                        ))}
                      </div>
                      <Badge variant="secondary" className={`text-xs ${priorityStyles[task.priority]}`}>
                        {task.priority}
                      </Badge>
                    </div>
                  </motion.div>
                ))}
                {columnTasks.length === 0 && (
                  <div className="flex items-center justify-center h-full text-muted-foreground text-sm py-8">
                    Drop tasks here
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Task Detail Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto" data-testid={`task-detail-dialog-${selectedTask?.id}`}>
        {selectedTask && (
          <>
            <DialogHeader>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <DialogTitle className="text-xl font-semibold pr-8">
                    {selectedTask.title}
                  </DialogTitle>
                  <div className="flex items-center gap-2 mt-2">
                    <Badge variant="secondary" className={`text-xs ${priorityStyles[selectedTask.priority]}`}>
                      {selectedTask.priority} priority
                    </Badge>
                    <Badge variant="secondary" className={`text-xs ${statusStyles[selectedTask.status]?.bg} ${statusStyles[selectedTask.status]?.text}`}>
                      {statusStyles[selectedTask.status]?.label}
                    </Badge>
                  </div>
                </div>
              </div>
            </DialogHeader>

            <DialogDescription asChild>
              <div className="space-y-4">
                {/* Title & Priority - Edit Mode */}
                {isEditMode && (
                  <>
                    <div>
                      <h4 className="text-sm font-semibold mb-2 text-foreground">Task Title</h4>
                      <Input
                        value={editedTask?.title || ''}
                        onChange={(e) => handleFieldChange('title', e.target.value)}
                        placeholder="Task title"
                        data-testid={`edit-title-${selectedTask.id}`}
                      />
                    </div>
                    <div>
                      <h4 className="text-sm font-semibold mb-2 text-foreground">Priority</h4>
                      <Select value={editedTask?.priority} onValueChange={(value) => handleFieldChange('priority', value)}>
                        <SelectTrigger className="w-full bg-background" data-testid={`priority-select-${selectedTask.id}`}>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-background">
                          <SelectItem value="low" data-testid="priority-low">Low</SelectItem>
                          <SelectItem value="medium" data-testid="priority-medium">Medium</SelectItem>
                          <SelectItem value="high" data-testid="priority-high">High</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </>
                )}

                {/* Description */}
                <div>
                  <h4 className="text-sm font-semibold mb-2 text-foreground">Description</h4>
                  {isEditMode ? (
                    <Textarea
                      value={editedTask?.description || ''}
                      onChange={(e) => handleFieldChange('description', e.target.value)}
                      placeholder="Task description"
                      rows={4}
                      data-testid={`edit-description-${selectedTask.id}`}
                    />
                  ) : (
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {selectedTask.description}
                    </p>
                  )}
                </div>

                {/* Key Details Grid */}
                <div className="grid grid-cols-2 gap-4 py-4 border-y border-border">
                  <div className="flex items-start gap-2">
                    <Calendar className="w-4 h-4 text-muted-foreground mt-0.5" />
                    <div className="flex-1">
                      <p className="text-xs text-muted-foreground mb-1">Due Date</p>
                      {isEditMode ? (
                        <Input
                          type="date"
                          value={editedTask?.dueDateFull ? new Date(editedTask.dueDateFull).toISOString().split('T')[0] : ''}
                          onChange={(e) => handleFieldChange('dueDateFull', e.target.value)}
                          data-testid={`edit-duedate-${selectedTask.id}`}
                        />
                      ) : (
                        <p className="text-sm font-medium text-foreground">{selectedTask.dueDateFull}</p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <Clock className="w-4 h-4 text-muted-foreground mt-0.5" />
                    <div className="flex-1">
                      <p className="text-xs text-muted-foreground mb-1">Estimated Hours</p>
                      {isEditMode ? (
                        <Input
                          type="number"
                          value={editedTask?.estimatedHours || ''}
                          onChange={(e) => handleFieldChange('estimatedHours', parseInt(e.target.value) || 0)}
                          data-testid={`edit-hours-${selectedTask.id}`}
                        />
                      ) : (
                        <p className="text-sm font-medium text-foreground">{selectedTask.estimatedHours}h</p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <Building2 className="w-4 h-4 text-muted-foreground mt-0.5" />
                    <div className="flex-1">
                      <p className="text-xs text-muted-foreground mb-1">Department</p>
                      {isEditMode ? (
                        <Select 
                          value={editedTask?.department || ''} 
                          onValueChange={(value) => handleFieldChange('department', value)}
                        >
                          <SelectTrigger className="bg-background" data-testid={`edit-department-${selectedTask.id}`}>
                            <SelectValue placeholder="Select department" />
                          </SelectTrigger>
                          <SelectContent className="bg-background">
                            <SelectItem value="Finance">Finance</SelectItem>
                            <SelectItem value="IT">IT</SelectItem>
                            <SelectItem value="HR">HR</SelectItem>
                            <SelectItem value="Sales">Sales</SelectItem>
                            <SelectItem value="Operations">Operations</SelectItem>
                            <SelectItem value="Marketing">Marketing</SelectItem>
                          </SelectContent>
                        </Select>
                      ) : (
                        <p className="text-sm font-medium text-foreground">{selectedTask.department}</p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <Users className="w-4 h-4 text-muted-foreground mt-0.5" />
                    <div className="flex-1">
                      <p className="text-xs text-muted-foreground mb-1">Created By</p>
                      <p className="text-sm font-medium text-foreground">{selectedTask.createdBy}</p>
                    </div>
                  </div>
                </div>

                {/* Assignees */}
                <div>
                  <h4 className="text-sm font-semibold mb-2 text-foreground flex items-center gap-2">
                    <Users className="w-4 h-4" />
                    Assigned Team Members
                    {isEditMode && editedTask?.department && (
                      <span className="text-xs text-muted-foreground font-normal">
                        (Showing {editedTask.department} team)
                      </span>
                    )}
                  </h4>
                  {isEditMode ? (
                    filteredTeamMembers.length > 0 ? (
                      <div className="space-y-2 border border-border rounded-md p-3 bg-background max-h-64 overflow-y-auto">
                        {filteredTeamMembers.map((member) => {
                        const isAssigned = editedTask?.assignees?.includes(member.initials) || false;
                        const availabilityColor = member.availability === 'available' 
                          ? 'text-status-success' 
                          : 'text-status-warning';
                        const availabilityBg = member.availability === 'available'
                          ? 'bg-status-success/10'
                          : 'bg-status-warning/10';
                        
                        return (
                          <div
                            key={member.id}
                            className="flex items-center justify-between p-2 rounded-md hover:bg-accent/50 transition-colors"
                          >
                            <div className="flex items-center gap-3 flex-1">
                              <Checkbox
                                checked={isAssigned}
                                onCheckedChange={() => handleAssigneeToggle(member.id, member.name, member.initials)}
                                data-testid={`assign-member-${member.id}`}
                              />
                              <Avatar className="w-8 h-8">
                                <AvatarFallback className="text-xs bg-primary text-primary-foreground">
                                  {member.initials}
                                </AvatarFallback>
                              </Avatar>
                              <div className="flex-1">
                                <p className="text-sm font-medium text-foreground">{member.name}</p>
                                <div className="flex items-center gap-2 mt-0.5">
                                  <span className={`text-xs ${availabilityColor} capitalize`}>
                                    {member.availability}
                                  </span>
                                  <span className="text-xs text-muted-foreground">•</span>
                                  <span className="text-xs text-muted-foreground">{member.hours}h this week</span>
                                </div>
                              </div>
                              <Badge 
                                variant="outline" 
                                className={`text-xs ${availabilityBg} ${availabilityColor} border-0`}
                              >
                                {member.hours > 40 ? 'Overloaded' : member.hours > 38 ? 'Near capacity' : 'Available'}
                              </Badge>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="border border-border rounded-md p-6 bg-accent/20 text-center">
                      <p className="text-sm text-muted-foreground">
                        {editedTask?.department 
                          ? `No team members available in ${editedTask.department}`
                          : 'Select a department to see available team members'
                        }
                      </p>
                    </div>
                  )) : (
                    <div className="flex flex-wrap gap-2">
                      {selectedTask.assigneeNames && selectedTask.assigneeNames.map((name, idx) => (
                        <div key={idx} className="flex items-center gap-2 bg-accent px-3 py-1.5 rounded-md">
                          <Avatar className="w-6 h-6">
                            <AvatarFallback className="text-xs bg-primary text-primary-foreground">
                              {selectedTask.assignees[idx]}
                            </AvatarFallback>
                          </Avatar>
                          <span className="text-sm text-foreground">{name}</span>
                        </div>
                      ))}
                      {(!selectedTask.assigneeNames || selectedTask.assigneeNames.length === 0) && (
                        <p className="text-sm text-muted-foreground italic">No assignees yet</p>
                      )}
                    </div>
                  )}
                </div>

                {/* Required Skills */}
                {(selectedTask.skills && selectedTask.skills.length > 0) || isEditMode ? (
                  <div>
                    <h4 className="text-sm font-semibold mb-2 text-foreground">Required Skills</h4>
                    {isEditMode ? (
                      <Input
                        value={editedTask?.skills ? editedTask.skills.join(', ') : ''}
                        onChange={(e) => handleSkillsChange(e.target.value)}
                        placeholder="Enter skills separated by commas"
                        data-testid={`edit-skills-${selectedTask.id}`}
                      />
                    ) : (
                      <div className="flex flex-wrap gap-2">
                        {selectedTask.skills.map((skill, idx) => (
                          <Badge key={idx} variant="outline" className="text-xs">
                            {skill}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>
                ) : null}

                {/* Progress Notes */}
                {(selectedTask.progressNotes || isEditMode) && (
                  <div className="bg-status-info/10 p-3 rounded-md border border-status-info/20">
                    <div className="flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-status-info mt-0.5 flex-shrink-0" />
                      <div className="flex-1">
                        <h4 className="text-sm font-semibold text-foreground mb-1">Progress Update</h4>
                        {isEditMode ? (
                          <Textarea
                            value={editedTask?.progressNotes || ''}
                            onChange={(e) => handleFieldChange('progressNotes', e.target.value)}
                            placeholder="Add progress notes..."
                            rows={2}
                            data-testid={`edit-progress-${selectedTask.id}`}
                          />
                        ) : (
                          <p className="text-sm text-muted-foreground">{selectedTask.progressNotes}</p>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* Blocked Reason */}
                {(selectedTask.blockedReason || isEditMode) && (
                  <div className="bg-status-warning/10 p-3 rounded-md border border-status-warning/20">
                    <div className="flex items-start gap-2">
                      <AlertCircle className="w-4 h-4 text-status-warning mt-0.5 flex-shrink-0" />
                      <div className="flex-1">
                        <h4 className="text-sm font-semibold text-foreground mb-1">Blocked Reason</h4>
                        {isEditMode ? (
                          <Textarea
                            value={editedTask?.blockedReason || ''}
                            onChange={(e) => handleFieldChange('blockedReason', e.target.value)}
                            placeholder="Explain why this task is blocked..."
                            rows={2}
                            data-testid={`edit-blocked-${selectedTask.id}`}
                          />
                        ) : (
                          <p className="text-sm text-muted-foreground">{selectedTask.blockedReason}</p>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* Change Status */}
                <div>
                  <h4 className="text-sm font-semibold mb-2 text-foreground">Change Status</h4>
                  <Select value={selectedTask.status} onValueChange={handleStatusChange}>
                    <SelectTrigger className="w-full bg-background" data-testid={`status-select-${selectedTask.id}`}>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-background">
                      <SelectItem value="todo" data-testid="status-todo">To Do</SelectItem>
                      <SelectItem value="inprogress" data-testid="status-inprogress">In Progress</SelectItem>
                      <SelectItem value="blocked" data-testid="status-blocked">Blocked</SelectItem>
                      <SelectItem value="completed" data-testid="status-completed">Completed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </DialogDescription>

            <DialogFooter className="flex-col sm:flex-row gap-2">
              {isEditMode ? (
                /* Edit Mode Buttons */
                <div className="flex gap-2 w-full justify-end">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleCancelEdit}
                    data-testid={`cancel-edit-${selectedTask.id}`}
                  >
                    <X className="w-4 h-4 mr-2" />
                    Cancel
                  </Button>
                  <Button
                    size="sm"
                    onClick={handleSaveEdit}
                    data-testid={`save-edit-${selectedTask.id}`}
                  >
                    <CheckCircle2 className="w-4 h-4 mr-2" />
                    Save Changes
                  </Button>
                </div>
              ) : (
                /* View Mode Buttons */
                <>
                  <div className="flex gap-2 flex-1">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleDeleteTask}
                      className="text-status-danger hover:bg-status-danger/10"
                      data-testid={`delete-task-${selectedTask.id}`}
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      Delete Task
                    </Button>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleEditClick}
                      data-testid={`edit-task-${selectedTask.id}`}
                    >
                      <Edit className="w-4 h-4 mr-2" />
                      Edit
                    </Button>
                    <Button
                      size="sm"
                      onClick={handleCloseDialog}
                      data-testid={`close-dialog-${selectedTask.id}`}
                    >
                      <CheckCircle2 className="w-4 h-4 mr-2" />
                      Done
                    </Button>
                  </div>
                </>
              )}
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
    </Card>
    </>
  );
};

export default KanbanBoard;
