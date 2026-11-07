import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  ArrowLeft, 
  Mail, 
  Phone, 
  Calendar, 
  MapPin, 
  Briefcase, 
  Award,
  Clock,
  CheckCircle2,
  AlertCircle,
  Edit,
  MoreVertical,
  Plus,
  TrendingUp
} from 'lucide-react';
import { Card } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Avatar, AvatarFallback } from '../components/ui/avatar';
import { Badge } from '../components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../components/ui/table';

const EmployeeDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [employee, setEmployee] = useState(null);
  const [activities, setActivities] = useState([]);
  const [assignedTasks, setAssignedTasks] = useState([]);

  useEffect(() => {
    // Load employee data
    const team = JSON.parse(localStorage.getItem('teamMembers') || '[]');
    const foundEmployee = team.find(m => m.id === parseInt(id));
    
    if (foundEmployee) {
      setEmployee(foundEmployee);
      
      // Generate activity timeline
      const mockActivities = [
        {
          id: 1,
          type: 'task_completed',
          description: 'Completed "Q4 Budget Review"',
          timestamp: '2 hours ago',
          icon: CheckCircle2,
          color: 'text-status-success'
        },
        {
          id: 2,
          type: 'meeting',
          description: 'Attended Team Standup',
          timestamp: '5 hours ago',
          icon: Calendar,
          color: 'text-status-info'
        },
        {
          id: 3,
          type: 'task_assigned',
          description: 'Assigned to "Client Onboarding"',
          timestamp: '1 day ago',
          icon: Briefcase,
          color: 'text-primary'
        },
        {
          id: 4,
          type: 'schedule_updated',
          description: 'Schedule updated for next week',
          timestamp: '2 days ago',
          icon: Clock,
          color: 'text-muted-foreground'
        },
        {
          id: 5,
          type: 'status_change',
          description: 'Status changed to Available',
          timestamp: '3 days ago',
          icon: TrendingUp,
          color: 'text-status-success'
        }
      ];
      setActivities(mockActivities);

      // Load assigned tasks
      const allTasks = JSON.parse(localStorage.getItem('allTasks') || '[]');
      const memberTasks = allTasks.filter(task => 
        task.assignees && task.assignees.includes(foundEmployee.initials)
      );
      setAssignedTasks(memberTasks);
    }
  }, [id]);

  if (!employee) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-muted-foreground">Employee not found</p>
      </div>
    );
  }

  const availabilityColors = {
    'Available': 'bg-[hsl(var(--status-success)/.1)] text-[hsl(var(--status-success))] border border-[hsl(var(--status-success)/.2)]',
    'Busy': 'bg-[hsl(var(--status-warning)/.1)] text-[hsl(var(--status-warning))] border border-[hsl(var(--status-warning)/.2)]',
    'Off': 'bg-muted text-foreground',
  };

  const statusColors = {
    'Open': 'bg-muted text-foreground',
    'In Progress': 'bg-[hsl(var(--status-info)/.1)] text-[hsl(var(--status-info))] border border-[hsl(var(--status-info)/.2)]',
    'Blocked': 'bg-[hsl(var(--status-warning)/.1)] text-[hsl(var(--status-warning))] border border-[hsl(var(--status-warning)/.2)]',
    'Completed': 'bg-[hsl(var(--status-success)/.1)] text-[hsl(var(--status-success))] border border-[hsl(var(--status-success)/.2)]',
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
      data-testid="employee-detail-page"
    >
      {/* Back Button */}
      <Button 
        variant="ghost" 
        onClick={() => navigate('/team')}
        data-testid="back-to-team"
      >
        <ArrowLeft className="w-4 h-4 mr-2" />
        Back to Team
      </Button>

      {/* Header Card */}
      <Card className="p-6">
        <div className="flex flex-col md:flex-row gap-6">
          <div className="flex-shrink-0">
            <Avatar className="w-24 h-24">
              <AvatarFallback className="bg-primary text-primary-foreground text-3xl font-bold">
                {employee.initials}
              </AvatarFallback>
            </Avatar>
          </div>
          
          <div className="flex-1">
            <div className="flex items-start justify-between flex-wrap gap-4">
              <div>
                <h1 className="text-3xl font-bold tracking-tight">{employee.name}</h1>
                <p className="text-lg text-muted-foreground mt-1">{employee.role}</p>
                <div className="flex items-center gap-2 mt-3">
                  <Badge variant="secondary" className={`text-xs ${availabilityColors[employee.availability]}`}>
                    {employee.availability}
                  </Badge>
                  <Badge variant="outline" className="text-xs">
                    {employee.department}
                  </Badge>
                </div>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" data-testid="edit-employee">
                  <Edit className="w-4 h-4 mr-2" />
                  Edit Profile
                </Button>
                <Button variant="ghost" size="icon" data-testid="more-options">
                  <MoreVertical className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* Contact Info */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-6">
              <div className="flex items-center gap-3">
                <Mail className="w-4 h-4 text-muted-foreground" />
                <div>
                  <p className="text-xs text-muted-foreground">Email</p>
                  <p className="text-sm font-medium">{employee.email}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Phone className="w-4 h-4 text-muted-foreground" />
                <div>
                  <p className="text-xs text-muted-foreground">Phone</p>
                  <p className="text-sm font-medium">{employee.phone}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Briefcase className="w-4 h-4 text-muted-foreground" />
                <div>
                  <p className="text-xs text-muted-foreground">Employee ID</p>
                  <p className="text-sm font-medium">EMP-{employee.id.toString().padStart(4, '0')}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Tabs */}
      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-4 lg:w-auto lg:inline-grid">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="tasks">Tasks ({assignedTasks.length})</TabsTrigger>
          <TabsTrigger value="activity">Activity</TabsTrigger>
          <TabsTrigger value="details">Details</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Skills */}
            <Card className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <Award className="w-5 h-5 text-primary" />
                  Skills & Expertise
                </h3>
                <Button variant="ghost" size="sm" data-testid="add-skill">
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
              <div className="flex flex-wrap gap-2">
                {employee.skills.map((skill, i) => (
                  <Badge key={i} variant="secondary" className="text-sm">
                    {skill}
                  </Badge>
                ))}
              </div>
            </Card>

            {/* Performance Stats */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Performance Overview</h3>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-muted-foreground">Tasks Completed</span>
                    <span className="font-semibold">24 / 30</span>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div className="h-full bg-status-success" style={{ width: '80%' }} />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-muted-foreground">Utilization Rate</span>
                    <span className="font-semibold">82%</span>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div className="h-full bg-primary" style={{ width: '82%' }} />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-muted-foreground">Attendance</span>
                    <span className="font-semibold">98%</span>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div className="h-full bg-status-info" style={{ width: '98%' }} />
                  </div>
                </div>
              </div>
            </Card>
          </div>

          {/* Recent Activity Preview */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Recent Activity</h3>
            <div className="space-y-3">
              {activities.slice(0, 3).map((activity) => {
                const Icon = activity.icon;
                return (
                  <div key={activity.id} className="flex items-start gap-3 p-3 rounded-md hover:bg-accent/50">
                    <Icon className={`w-5 h-5 ${activity.color} mt-0.5`} />
                    <div className="flex-1">
                      <p className="text-sm">{activity.description}</p>
                      <p className="text-xs text-muted-foreground mt-1">{activity.timestamp}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>
        </TabsContent>

        {/* Tasks Tab */}
        <TabsContent value="tasks">
          <Card className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold">Assigned Tasks</h3>
              <Button variant="outline" size="sm" data-testid="assign-new-task">
                <Plus className="w-4 h-4 mr-2" />
                Assign Task
              </Button>
            </div>
            
            {assignedTasks.length > 0 ? (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Task</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Priority</TableHead>
                      <TableHead>Due Date</TableHead>
                      <TableHead>Department</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {assignedTasks.map((task) => (
                      <TableRow key={task.id} className="hover:bg-accent/50">
                        <TableCell className="font-medium">{task.title}</TableCell>
                        <TableCell>
                          <Badge variant="secondary" className={`text-xs ${statusColors[task.status]}`}>
                            {task.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant="secondary" className={`text-xs ${priorityColors[task.priority]}`}>
                            {task.priority}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">{task.dueDate}</TableCell>
                        <TableCell className="text-sm">{task.department}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <div className="text-center py-12">
                <p className="text-muted-foreground">No tasks assigned yet</p>
              </div>
            )}
          </Card>
        </TabsContent>

        {/* Activity Tab */}
        <TabsContent value="activity">
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-6">Activity Timeline</h3>
            <div className="space-y-4">
              {activities.map((activity, idx) => {
                const Icon = activity.icon;
                return (
                  <motion.div
                    key={activity.id}
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    className="flex items-start gap-4 pb-4 border-b border-border last:border-0"
                  >
                    <div className={`p-2 rounded-full bg-accent ${activity.color}`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">{activity.description}</p>
                      <p className="text-xs text-muted-foreground mt-1">{activity.timestamp}</p>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </Card>
        </TabsContent>

        {/* Details Tab */}
        <TabsContent value="details">
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-6">Employee Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="text-sm font-semibold text-muted-foreground mb-3">Personal Information</h4>
                <div className="space-y-3">
                  <div>
                    <p className="text-xs text-muted-foreground">Full Name</p>
                    <p className="text-sm font-medium">{employee.name}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Employee ID</p>
                    <p className="text-sm font-medium">EMP-{employee.id.toString().padStart(4, '0')}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Email</p>
                    <p className="text-sm font-medium">{employee.email}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Phone</p>
                    <p className="text-sm font-medium">{employee.phone}</p>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="text-sm font-semibold text-muted-foreground mb-3">Work Information</h4>
                <div className="space-y-3">
                  <div>
                    <p className="text-xs text-muted-foreground">Role</p>
                    <p className="text-sm font-medium">{employee.role}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Department</p>
                    <p className="text-sm font-medium">{employee.department}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Current Status</p>
                    <Badge variant="secondary" className={`text-xs ${availabilityColors[employee.availability]}`}>
                      {employee.availability}
                    </Badge>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Skills</p>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {employee.skills.map((skill, i) => (
                        <Badge key={i} variant="outline" className="text-xs">
                          {skill}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </motion.div>
  );
};

export default EmployeeDetail;
