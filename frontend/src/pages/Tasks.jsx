import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Plus, Filter, Search, X, Edit, Trash2 } from 'lucide-react';
import { Card } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Textarea } from '../components/ui/textarea';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../components/ui/table';
import { Badge } from '../components/ui/badge';
import { Avatar, AvatarFallback } from '../components/ui/avatar';
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
import { Checkbox } from '../components/ui/checkbox';

const initialTasks = [
  {
    id: 1,
    title: 'Prepare payroll variance report',
    status: 'Open',
    priority: 'High',
    department: 'Finance',
    assignees: ['AD', 'MB'],
    dueDate: 'Jan 16',
  },
  {
    id: 2,
    title: 'Client onboarding session',
    status: 'Open',
    priority: 'Medium',
    department: 'Sales',
    assignees: ['AC'],
    dueDate: 'Jan 14',
  },
  {
    id: 3,
    title: 'System migration phase 2',
    status: 'In Progress',
    priority: 'High',
    department: 'IT',
    assignees: ['JK', 'LM', 'PQ'],
    dueDate: 'Jan 17',
  },
  {
    id: 4,
    title: 'Employee satisfaction survey',
    status: 'In Progress',
    priority: 'Low',
    department: 'HR',
    assignees: ['SM'],
    dueDate: 'Jan 20',
  },
  {
    id: 5,
    title: 'Q4 budget review meeting',
    status: 'Blocked',
    priority: 'High',
    department: 'Finance',
    assignees: ['JD'],
    dueDate: 'Jan 15',
  },
  {
    id: 6,
    title: 'Update HR policy documentation',
    status: 'Open',
    priority: 'Low',
    department: 'HR',
    assignees: [],
    dueDate: 'Jan 22',
  },
];

// Available team members with departments
const availableTeamMembers = [
  { id: 'AD', name: 'Alex Davis', initials: 'AD', department: 'Finance' },
  { id: 'MB', name: 'Maria Brown', initials: 'MB', department: 'Finance' },
  { id: 'AC', name: 'Avery Chen', initials: 'AC', department: 'Sales' },
  { id: 'JK', name: 'John Kim', initials: 'JK', department: 'IT' },
  { id: 'LM', name: 'Lisa Martinez', initials: 'LM', department: 'IT' },
  { id: 'PQ', name: 'Paul Quinn', initials: 'PQ', department: 'IT' },
  { id: 'SM', name: 'Sarah Mitchell', initials: 'SM', department: 'HR' },
  { id: 'JD', name: 'John Doe', initials: 'JD', department: 'Finance' },
];

// Available departments
const departments = ['Finance', 'IT', 'HR', 'Sales', 'Operations', 'Marketing'];

const Tasks = () => {
  const location = window.location;
  const navigate = useNavigate();
  
  // Check if there's a filter param from navigation
  const urlParams = new URLSearchParams(location.search);
  const initialFilter = urlParams.get('filter') || 'all';
  
  const [tasks, setTasks] = useState(() => {
    const saved = localStorage.getItem('allTasks');
    return saved ? JSON.parse(saved) : initialTasks;
  });

  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState(initialFilter);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false);
  const [newTask, setNewTask] = useState({
    title: '',
    status: 'Open',
    priority: 'Medium',
    department: '',
    assignees: [],
    dueDate: '',
  });

  useEffect(() => {
    localStorage.setItem('allTasks', JSON.stringify(tasks));
  }, [tasks]);

  const handleCreateTask = () => {
    if (newTask.title.trim()) {
      const task = {
        id: tasks.length + 1,
        title: newTask.title,
        status: newTask.status,
        priority: newTask.priority,
        department: newTask.department || 'General',
        assignees: newTask.assignees,
        dueDate: newTask.dueDate || 'TBD',
      };
      setTasks([...tasks, task]);
      setIsCreateDialogOpen(false);
      // Reset form
      setNewTask({
        title: '',
        status: 'Open',
        priority: 'Medium',
        department: '',
        assignees: [],
        dueDate: '',
      });
    }
  };

  const handleAssigneeToggle = (memberInitials) => {
    setNewTask(prev => {
      const isAssigned = prev.assignees.includes(memberInitials);
      return {
        ...prev,
        assignees: isAssigned
          ? prev.assignees.filter(a => a !== memberInitials)
          : [...prev.assignees, memberInitials]
      };
    });
  };

  // Filter team members by selected department
  const filteredTeamMembers = newTask.department 
    ? availableTeamMembers.filter(member => member.department === newTask.department)
    : availableTeamMembers;

  const handleTaskClick = (task) => {
    setSelectedTask(task);
    setIsDetailDialogOpen(true);
  };

  const handleStatusChange = (taskId, newStatus) => {
    setTasks(prevTasks =>
      prevTasks.map(task =>
        task.id === taskId ? { ...task, status: newStatus } : task
      )
    );
    if (selectedTask && selectedTask.id === taskId) {
      setSelectedTask({ ...selectedTask, status: newStatus });
    }
  };

  const filteredTasks = tasks.filter(task => {
    const matchesSearch = task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          task.department.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = filterStatus === 'all' || task.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  const statusColors = {
    'Open': 'bg-muted text-foreground',
    'In Progress': 'bg-[hsl(var(--status-info)/.1)] text-[hsl(var(--status-info))] border border-[hsl(var(--status-info)/.2)]',
    'Blocked': 'bg-[hsl(var(--status-warning)/.1)] text-[hsl(var(--status-warning))] border border-[hsl(var(--status-warning)/.2)]',
    'Completed': 'bg-[hsl(var(--status-success)/.1)] text-[hsl(var(--status-success))] border border-[hsl(var(--status-success)/.2)]',
  };

  const statusDotColors = {
    'Open': 'bg-muted-foreground',
    'In Progress': 'bg-status-info',
    'Blocked': 'bg-status-warning',
    'Completed': 'bg-status-success',
  };

  const priorityColors = {
    'Low': 'bg-muted text-foreground',
    'Medium': 'bg-[hsl(var(--status-info)/.1)] text-[hsl(var(--status-info))] border border-[hsl(var(--status-info)/.2)]',
    'High': 'bg-[hsl(var(--status-danger)/.1)] text-[hsl(var(--status-danger))] border border-[hsl(var(--status-danger)/.2)]',
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.22 }}
      className="space-y-6"
      data-testid="tasks-page"
    >
      <div>
        <h1 className="text-3xl font-semibold tracking-tight">Tasks</h1>
        <p className="text-muted-foreground mt-1">Manage and distribute work assignments</p>
      </div>

      <Card className="p-6 shadow-sm">
        <div className="flex items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-3 flex-1">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search tasks..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
                data-testid="task-search-input"
              />
            </div>
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-[140px] bg-background" data-testid="filter-button">
                <Filter className="w-4 h-4 mr-2" />
                <SelectValue placeholder="Filter" />
              </SelectTrigger>
              <SelectContent className="bg-background">
                <SelectItem value="all">All Tasks</SelectItem>
                <SelectItem value="Open">Open</SelectItem>
                <SelectItem value="In Progress">In Progress</SelectItem>
                <SelectItem value="Blocked">Blocked</SelectItem>
                <SelectItem value="Completed">Completed</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Button onClick={() => setIsCreateDialogOpen(true)} data-testid="create-task-button">
            <Plus className="w-4 h-4 mr-2" />
            Create Task
          </Button>
        </div>

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[40%]">Task</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Priority</TableHead>
              <TableHead>Department</TableHead>
              <TableHead>Assignees</TableHead>
              <TableHead>Due Date</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredTasks.map((task, idx) => (
              <motion.tr
                key={task.id}
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.04, duration: 0.22 }}
                className="border-t border-border hover:bg-accent/50 transition-colors cursor-pointer"
                data-testid={`task-row-${task.id}`}
              >
                <TableCell className="font-medium" onClick={() => handleTaskClick(task)}>{task.title}</TableCell>
                <TableCell onClick={(e) => e.stopPropagation()}>
                  <Select value={task.status} onValueChange={(value) => handleStatusChange(task.id, value)}>
                    <SelectTrigger className="w-[150px] h-7 bg-background border-0 focus:ring-0" data-testid={`status-dropdown-${task.id}`}>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-background">
                      <SelectItem value="Open">
                        <div className="flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full bg-muted-foreground" />
                          Open
                        </div>
                      </SelectItem>
                      <SelectItem value="In Progress">
                        <div className="flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full bg-status-info" />
                          In Progress
                        </div>
                      </SelectItem>
                      <SelectItem value="Blocked">
                        <div className="flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full bg-status-warning" />
                          Blocked
                        </div>
                      </SelectItem>
                      <SelectItem value="Completed">
                        <div className="flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full bg-status-success" />
                          Completed
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </TableCell>
                <TableCell onClick={() => handleTaskClick(task)}>
                  <div className={`inline-flex items-center rounded-md border border-transparent px-2.5 py-0.5 text-xs font-semibold ${priorityColors[task.priority]}`}>
                    {task.priority}
                  </div>
                </TableCell>
                <TableCell className="text-muted-foreground" onClick={() => handleTaskClick(task)}>{task.department}</TableCell>
                <TableCell onClick={() => handleTaskClick(task)}>
                  {task.assignees.length > 0 ? (
                    <div className="flex -space-x-1">
                      {task.assignees.slice(0, 3).map((assignee, i) => (
                        <Avatar key={i} className="w-6 h-6 border-2 border-card">
                          <AvatarFallback className="text-xs bg-primary text-primary-foreground">
                            {assignee}
                          </AvatarFallback>
                        </Avatar>
                      ))}
                      {task.assignees.length > 3 && (
                        <div className="w-6 h-6 rounded-full border-2 border-card bg-muted flex items-center justify-center text-xs">
                          +{task.assignees.length - 3}
                        </div>
                      )}
                    </div>
                  ) : (
                    <span className="text-xs text-muted-foreground">Unassigned</span>
                  )}
                </TableCell>
                <TableCell className="text-muted-foreground" onClick={() => handleTaskClick(task)}>{task.dueDate}</TableCell>
              </motion.tr>
            ))}
          </TableBody>
        </Table>

        {filteredTasks.length === 0 && (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No tasks found</p>
          </div>
        )}
      </Card>

      {/* Create Task Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto" data-testid="create-task-dialog">
          <DialogHeader>
            <DialogTitle>Create New Task</DialogTitle>
            <DialogDescription>
              Fill in the details to create a new task
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {/* Task Title */}
            <div>
              <label className="text-sm font-semibold mb-2 block">Task Title *</label>
              <Input
                value={newTask.title}
                onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                placeholder="Enter task title"
                data-testid="new-task-title"
              />
            </div>

            {/* Priority & Status */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-semibold mb-2 block">Priority</label>
                <Select value={newTask.priority} onValueChange={(value) => setNewTask({ ...newTask, priority: value })}>
                  <SelectTrigger className="bg-background" data-testid="new-task-priority">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-background">
                    <SelectItem value="Low">Low</SelectItem>
                    <SelectItem value="Medium">Medium</SelectItem>
                    <SelectItem value="High">High</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-semibold mb-2 block">Status</label>
                <Select value={newTask.status} onValueChange={(value) => setNewTask({ ...newTask, status: value })}>
                  <SelectTrigger className="bg-background" data-testid="new-task-status">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-background">
                    <SelectItem value="Open">
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-muted-foreground" />
                        Open
                      </div>
                    </SelectItem>
                    <SelectItem value="In Progress">
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-status-info" />
                        In Progress
                      </div>
                    </SelectItem>
                    <SelectItem value="Blocked">
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-status-warning" />
                        Blocked
                      </div>
                    </SelectItem>
                    <SelectItem value="Completed">
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-status-success" />
                        Completed
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Department & Due Date */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-semibold mb-2 block">Department</label>
                <Select 
                  value={newTask.department} 
                  onValueChange={(value) => setNewTask({ ...newTask, department: value, assignees: [] })}
                >
                  <SelectTrigger className="bg-background" data-testid="new-task-department">
                    <SelectValue placeholder="Select department" />
                  </SelectTrigger>
                  <SelectContent className="bg-background">
                    {departments.map(dept => (
                      <SelectItem key={dept} value={dept}>{dept}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-semibold mb-2 block">Due Date</label>
                <Input
                  type="date"
                  value={newTask.dueDate}
                  onChange={(e) => setNewTask({ ...newTask, dueDate: e.target.value })}
                  data-testid="new-task-duedate"
                />
              </div>
            </div>

            {/* Assign Team Members */}
            <div>
              <label className="text-sm font-semibold mb-2 block">
                Assign Team Members
                {newTask.department && (
                  <span className="text-xs text-muted-foreground font-normal ml-2">
                    (Showing {newTask.department} team)
                  </span>
                )}
              </label>
              {!newTask.department ? (
                <div className="border border-border rounded-md p-6 bg-accent/20 text-center">
                  <p className="text-sm text-muted-foreground">
                    Please select a department first to see available team members
                  </p>
                </div>
              ) : (
                <div className="border border-border rounded-md p-3 bg-background space-y-2 max-h-48 overflow-y-auto">
                  {filteredTeamMembers.length > 0 ? (
                    filteredTeamMembers.map((member) => (
                      <div
                        key={member.id}
                        className="flex items-center gap-3 p-2 rounded-md hover:bg-accent/50 transition-colors"
                      >
                        <Checkbox
                          checked={newTask.assignees.includes(member.initials)}
                          onCheckedChange={() => handleAssigneeToggle(member.initials)}
                          data-testid={`new-task-assign-${member.id}`}
                        />
                        <Avatar className="w-8 h-8">
                          <AvatarFallback className="text-xs bg-primary text-primary-foreground">
                            {member.initials}
                          </AvatarFallback>
                        </Avatar>
                        <span className="text-sm">{member.name}</span>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-4">
                      <p className="text-sm text-muted-foreground">
                        No team members available in {newTask.department}
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsCreateDialogOpen(false)}
              data-testid="cancel-create-task"
            >
              <X className="w-4 h-4 mr-2" />
              Cancel
            </Button>
            <Button
              onClick={handleCreateTask}
              disabled={!newTask.title.trim()}
              data-testid="confirm-create-task"
            >
              <Plus className="w-4 h-4 mr-2" />
              Create Task
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Task Detail Dialog */}
      <Dialog open={isDetailDialogOpen} onOpenChange={setIsDetailDialogOpen}>
        <DialogContent className="max-w-2xl" data-testid="task-detail-dialog">
          {selectedTask && (
            <>
              <DialogHeader>
                <DialogTitle>{selectedTask.title}</DialogTitle>
                <DialogDescription>
                  Task details and information
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4 py-4">
                {/* Status and Priority */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-semibold mb-2 block">Status</label>
                    <Select value={selectedTask.status} onValueChange={(value) => handleStatusChange(selectedTask.id, value)}>
                      <SelectTrigger className="bg-background" data-testid="detail-status">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-background">
                        <SelectItem value="Open">
                          <div className="flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-muted-foreground" />
                            Open
                          </div>
                        </SelectItem>
                        <SelectItem value="In Progress">
                          <div className="flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-status-info" />
                            In Progress
                          </div>
                        </SelectItem>
                        <SelectItem value="Blocked">
                          <div className="flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-status-warning" />
                            Blocked
                          </div>
                        </SelectItem>
                        <SelectItem value="Completed">
                          <div className="flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-status-success" />
                            Completed
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="text-sm font-semibold mb-2 block">Priority</label>
                    <div className={`inline-flex items-center rounded-md border border-transparent px-2.5 py-1.5 text-sm font-semibold ${priorityColors[selectedTask.priority]}`}>
                      {selectedTask.priority}
                    </div>
                  </div>
                </div>

                {/* Department */}
                <div>
                  <label className="text-sm font-semibold mb-2 block">Department</label>
                  <p className="text-sm text-muted-foreground">{selectedTask.department}</p>
                </div>

                {/* Due Date */}
                <div>
                  <label className="text-sm font-semibold mb-2 block">Due Date</label>
                  <p className="text-sm text-muted-foreground">{selectedTask.dueDate}</p>
                </div>

                {/* Assigned Team Members */}
                <div>
                  <label className="text-sm font-semibold mb-2 block">Assigned Team Members</label>
                  {selectedTask.assignees && selectedTask.assignees.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {selectedTask.assignees.map((assignee, idx) => (
                        <div key={idx} className="flex items-center gap-2 bg-accent px-3 py-1.5 rounded-md">
                          <Avatar className="w-6 h-6">
                            <AvatarFallback className="text-xs bg-primary text-primary-foreground">
                              {assignee}
                            </AvatarFallback>
                          </Avatar>
                          <span className="text-sm">{assignee}</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground italic">No assignees</p>
                  )}
                </div>

                {/* Quick Actions */}
                <div className="border-t border-border pt-4 mt-4">
                  <p className="text-xs text-muted-foreground mb-2">Quick Actions</p>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm">
                      <Edit className="w-4 h-4 mr-2" />
                      Edit Full Details
                    </Button>
                    <Button variant="outline" size="sm" className="text-status-danger hover:bg-status-danger/10">
                      <Trash2 className="w-4 h-4 mr-2" />
                      Delete Task
                    </Button>
                  </div>
                </div>
              </div>

              <DialogFooter>
                <Button onClick={() => setIsDetailDialogOpen(false)} data-testid="close-detail">
                  Close
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </motion.div>
  );
};

export default Tasks;
