import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Users, Mail, Phone, Calendar, MoreVertical, Plus, X, Grid3x3, List } from 'lucide-react';
import { Card } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Avatar, AvatarFallback } from '../components/ui/avatar';
import { Badge } from '../components/ui/badge';
import { Textarea } from '../components/ui/textarea';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../components/ui/dropdown-menu';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../components/ui/table';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '../components/ui/tabs';
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

const initialTeam = [
  {
    id: 1,
    name: 'Avery Chen',
    initials: 'AC',
    role: 'Sales Manager',
    department: 'Sales',
    email: 'avery.chen@company.com',
    phone: '+1 (555) 123-4567',
    status: 'active',
    skills: ['Onboarding', 'Client Relations', 'CRM'],
    availability: 'Available',
  },
  {
    id: 2,
    name: 'Sarah Mitchell',
    initials: 'SM',
    role: 'HR Specialist',
    department: 'HR',
    email: 'sarah.mitchell@company.com',
    phone: '+1 (555) 234-5678',
    status: 'active',
    skills: ['Employee Relations', 'Recruitment', 'Policy'],
    availability: 'Available',
  },
  {
    id: 3,
    name: 'John Kim',
    initials: 'JK',
    role: 'Senior Developer',
    department: 'IT',
    email: 'john.kim@company.com',
    phone: '+1 (555) 345-6789',
    status: 'active',
    skills: ['System Architecture', 'Database', 'Migration'],
    availability: 'Busy',
  },
  {
    id: 4,
    name: 'Lisa Martinez',
    initials: 'LM',
    role: 'DevOps Engineer',
    department: 'IT',
    email: 'lisa.martinez@company.com',
    phone: '+1 (555) 456-7890',
    status: 'active',
    skills: ['Cloud Infrastructure', 'CI/CD', 'Monitoring'],
    availability: 'Available',
  },
  {
    id: 5,
    name: 'Alex Davis',
    initials: 'AD',
    role: 'Financial Analyst',
    department: 'Finance',
    email: 'alex.davis@company.com',
    phone: '+1 (555) 567-8901',
    status: 'active',
    skills: ['Budgeting', 'Forecasting', 'Reporting'],
    availability: 'Available',
  },
  {
    id: 6,
    name: 'Maria Brown',
    initials: 'MB',
    role: 'Payroll Coordinator',
    department: 'Finance',
    email: 'maria.brown@company.com',
    phone: '+1 (555) 678-9012',
    status: 'active',
    skills: ['Payroll Processing', 'Tax Compliance', 'Benefits'],
    availability: 'Available',
  },
];

const Team = () => {
  const navigate = useNavigate();
  const [team, setTeam] = useState(() => {
    const saved = localStorage.getItem('teamMembers');
    return saved ? JSON.parse(saved) : initialTeam;
  });

  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'
  const [isAddMemberOpen, setIsAddMemberOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [selectedMember, setSelectedMember] = useState(null);
  const [newMember, setNewMember] = useState({
    name: '',
    role: '',
    department: '',
    email: '',
    phone: '',
    skills: '',
    availability: 'Available'
  });

  useEffect(() => {
    localStorage.setItem('teamMembers', JSON.stringify(team));
  }, [team]);

  const filteredTeam = team.filter(member =>
    member.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    member.department.toLowerCase().includes(searchQuery.toLowerCase()) ||
    member.role.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const availabilityColors = {
    'Available': 'bg-[hsl(var(--status-success)/.1)] text-[hsl(var(--status-success))] border border-[hsl(var(--status-success)/.2)]',
    'Busy': 'bg-[hsl(var(--status-warning)/.1)] text-[hsl(var(--status-warning))] border border-[hsl(var(--status-warning)/.2)]',
    'Off': 'bg-muted text-foreground',
  };

  const handleAddMember = () => {
    if (newMember.name.trim() && newMember.email.trim()) {
      const initials = newMember.name.split(' ').map(n => n[0]).join('').toUpperCase();
      const member = {
        id: team.length + 1,
        name: newMember.name,
        initials: initials,
        role: newMember.role || 'Team Member',
        department: newMember.department || 'General',
        email: newMember.email,
        phone: newMember.phone || 'Not provided',
        status: 'active',
        skills: newMember.skills ? newMember.skills.split(',').map(s => s.trim()) : [],
        availability: newMember.availability
      };
      setTeam([...team, member]);
      setIsAddMemberOpen(false);
      setNewMember({
        name: '',
        role: '',
        department: '',
        email: '',
        phone: '',
        skills: '',
        availability: 'Available'
      });
    }
  };

  const handleViewProfile = (member) => {
    setSelectedMember(member);
    setIsProfileOpen(true);
  };

  const handleAssignTask = (member) => {
    navigate('/tasks', { state: { assignTo: member } });
  };

  const handleViewSchedule = (member) => {
    navigate('/schedule', { state: { member: member } });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.22 }}
      className="space-y-6"
      data-testid="team-page"
    >
      <div>
        <h1 className="text-3xl font-semibold tracking-tight">Team</h1>
        <p className="text-muted-foreground mt-1">View and manage team members</p>
      </div>

      <Card className="p-6 shadow-sm">
        <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
          <Input
            type="text"
            placeholder="Search team members..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="max-w-xs"
            data-testid="search-team-input"
          />
          <div className="flex items-center gap-2">
            <div className="flex border border-border rounded-md">
              <Button
                variant={viewMode === 'grid' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('grid')}
                className="rounded-r-none"
                data-testid="grid-view-button"
              >
                <Grid3x3 className="w-4 h-4" />
              </Button>
              <Button
                variant={viewMode === 'list' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('list')}
                className="rounded-l-none"
                data-testid="list-view-button"
              >
                <List className="w-4 h-4" />
              </Button>
            </div>
            <Button onClick={() => setIsAddMemberOpen(true)} data-testid="add-member-button">
              <Plus className="w-4 h-4 mr-2" />
              Add Member
            </Button>
          </div>
        </div>

        {/* Grid View */}
        {viewMode === 'grid' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredTeam.map((member, idx) => (
              <motion.div
              key={member.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: idx * 0.04, duration: 0.22 }}
              whileHover={{ y: -4 }}
              data-testid={`team-member-${member.id}`}
            >
              <Card className="p-5 shadow-sm hover:shadow-md transition-all">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <Avatar className="w-12 h-12">
                      <AvatarFallback className="bg-primary text-primary-foreground text-base font-medium">
                        {member.initials}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <h3 className="text-sm font-semibold">{member.name}</h3>
                      <p className="text-xs text-muted-foreground">{member.role}</p>
                    </div>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MoreVertical className="w-4 h-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="bg-background">
                      <DropdownMenuItem onClick={() => handleViewProfile(member)} data-testid={`view-profile-${member.id}`}>
                        View Profile
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleAssignTask(member)} data-testid={`assign-task-${member.id}`}>
                        Assign Task
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleViewSchedule(member)} data-testid={`view-schedule-${member.id}`}>
                        View Schedule
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

                <div className="space-y-2 mb-4">
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Users className="w-3.5 h-3.5" />
                    <span>{member.department}</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Mail className="w-3.5 h-3.5" />
                    <span>{member.email}</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Phone className="w-3.5 h-3.5" />
                    <span>{member.phone}</span>
                  </div>
                </div>

                <div className="mb-4">
                  <p className="text-xs text-muted-foreground mb-2">Skills</p>
                  <div className="flex flex-wrap gap-1">
                    {member.skills.map((skill, i) => (
                      <Badge key={i} variant="secondary" className="text-xs">
                        {skill}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div className="pt-3 border-t border-border">
                  <Badge variant="secondary" className={`text-xs ${availabilityColors[member.availability]}`}>
                    {member.availability}
                  </Badge>
                </div>
              </Card>
            </motion.div>
          ))}
          </div>
        )}

        {/* List View */}
        {viewMode === 'list' && (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[50px]"></TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Department</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead>Skills</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="w-[50px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredTeam.map((member, idx) => (
                  <motion.tr
                    key={member.id}
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.04, duration: 0.22 }}
                    className="border-t border-border hover:bg-accent/50 transition-colors"
                    data-testid={`team-member-row-${member.id}`}
                  >
                    <TableCell>
                      <Avatar className="w-10 h-10">
                        <AvatarFallback className="bg-primary text-primary-foreground text-base font-medium">
                          {member.initials}
                        </AvatarFallback>
                      </Avatar>
                    </TableCell>
                    <TableCell className="font-medium">
                      <div>
                        <div className="font-semibold">{member.name}</div>
                        <div className="text-xs text-muted-foreground">{member.initials}</div>
                      </div>
                    </TableCell>
                    <TableCell className="text-sm">{member.role}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Users className="w-3.5 h-3.5 text-muted-foreground" />
                        <span className="text-sm">{member.department}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Mail className="w-3.5 h-3.5 text-muted-foreground" />
                        <span className="text-sm">{member.email}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Phone className="w-3.5 h-3.5 text-muted-foreground" />
                        <span className="text-sm">{member.phone}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1 max-w-[200px]">
                        {member.skills.slice(0, 3).map((skill, i) => (
                          <Badge key={i} variant="secondary" className="text-xs">
                            {skill}
                          </Badge>
                        ))}
                        {member.skills.length > 3 && (
                          <Badge variant="secondary" className="text-xs">
                            +{member.skills.length - 3}
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary" className={`text-xs ${availabilityColors[member.availability]}`}>
                        {member.availability}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" data-testid={`team-member-menu-${member.id}`}>
                            <MoreVertical className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="bg-background">
                          <DropdownMenuItem onClick={() => handleViewProfile(member)} data-testid={`view-profile-${member.id}`}>
                            View Profile
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleAssignTask(member)} data-testid={`assign-task-${member.id}`}>
                            Assign Task
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleViewSchedule(member)} data-testid={`view-schedule-${member.id}`}>
                            View Schedule
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </motion.tr>
                ))}
              </TableBody>
            </Table>
          </div>
        )}

        {filteredTeam.length === 0 && (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No team members found</p>
          </div>
        )}
      </Card>

      {/* Add Member Dialog */}
      <Dialog open={isAddMemberOpen} onOpenChange={setIsAddMemberOpen}>
        <DialogContent className="max-w-2xl" data-testid="add-member-dialog">
          <DialogHeader>
            <DialogTitle>Add New Team Member</DialogTitle>
            <DialogDescription>
              Fill in the details to add a new team member
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-semibold mb-2 block">Full Name *</label>
                <Input
                  value={newMember.name}
                  onChange={(e) => setNewMember({ ...newMember, name: e.target.value })}
                  placeholder="e.g., John Smith"
                  data-testid="new-member-name"
                />
              </div>
              <div>
                <label className="text-sm font-semibold mb-2 block">Email *</label>
                <Input
                  type="email"
                  value={newMember.email}
                  onChange={(e) => setNewMember({ ...newMember, email: e.target.value })}
                  placeholder="john.smith@company.com"
                  data-testid="new-member-email"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-semibold mb-2 block">Role</label>
                <Input
                  value={newMember.role}
                  onChange={(e) => setNewMember({ ...newMember, role: e.target.value })}
                  placeholder="e.g., Senior Developer"
                  data-testid="new-member-role"
                />
              </div>
              <div>
                <label className="text-sm font-semibold mb-2 block">Department</label>
                <Select value={newMember.department} onValueChange={(value) => setNewMember({ ...newMember, department: value })}>
                  <SelectTrigger className="bg-background" data-testid="new-member-department">
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
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-semibold mb-2 block">Phone</label>
                <Input
                  type="tel"
                  value={newMember.phone}
                  onChange={(e) => setNewMember({ ...newMember, phone: e.target.value })}
                  placeholder="+1 (555) 123-4567"
                  data-testid="new-member-phone"
                />
              </div>
              <div>
                <label className="text-sm font-semibold mb-2 block">Availability</label>
                <Select value={newMember.availability} onValueChange={(value) => setNewMember({ ...newMember, availability: value })}>
                  <SelectTrigger className="bg-background" data-testid="new-member-availability">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-background">
                    <SelectItem value="Available">Available</SelectItem>
                    <SelectItem value="Busy">Busy</SelectItem>
                    <SelectItem value="Off">Off</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <label className="text-sm font-semibold mb-2 block">Skills (comma-separated)</label>
              <Input
                value={newMember.skills}
                onChange={(e) => setNewMember({ ...newMember, skills: e.target.value })}
                placeholder="e.g., JavaScript, React, Node.js"
                data-testid="new-member-skills"
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddMemberOpen(false)} data-testid="cancel-add-member">
              <X className="w-4 h-4 mr-2" />
              Cancel
            </Button>
            <Button onClick={handleAddMember} disabled={!newMember.name.trim() || !newMember.email.trim()} data-testid="confirm-add-member">
              <Plus className="w-4 h-4 mr-2" />
              Add Member
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View Profile Dialog */}
      <Dialog open={isProfileOpen} onOpenChange={setIsProfileOpen}>
        <DialogContent className="max-w-2xl" data-testid="profile-dialog">
          {selectedMember && (
            <>
              <DialogHeader>
                <div className="flex items-center gap-4">
                  <Avatar className="w-16 h-16">
                    <AvatarFallback className="bg-primary text-primary-foreground text-xl font-medium">
                      {selectedMember.initials}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <DialogTitle>{selectedMember.name}</DialogTitle>
                    <DialogDescription>{selectedMember.role}</DialogDescription>
                  </div>
                </div>
              </DialogHeader>

              <div className="space-y-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-semibold mb-1 block text-foreground">Department</label>
                    <p className="text-sm text-muted-foreground">{selectedMember.department}</p>
                  </div>
                  <div>
                    <label className="text-sm font-semibold mb-1 block text-foreground">Availability</label>
                    <Badge variant="secondary" className={`text-xs ${availabilityColors[selectedMember.availability]}`}>
                      {selectedMember.availability}
                    </Badge>
                  </div>
                </div>

                <div>
                  <label className="text-sm font-semibold mb-1 block text-foreground">Contact Information</label>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Mail className="w-4 h-4" />
                      <span>{selectedMember.email}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Phone className="w-4 h-4" />
                      <span>{selectedMember.phone}</span>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="text-sm font-semibold mb-2 block text-foreground">Skills</label>
                  <div className="flex flex-wrap gap-2">
                    {selectedMember.skills.map((skill, i) => (
                      <Badge key={i} variant="outline" className="text-xs">
                        {skill}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div className="border-t border-border pt-4">
                  <label className="text-sm font-semibold mb-2 block text-foreground">Quick Actions</label>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={() => {
                      setIsProfileOpen(false);
                      handleAssignTask(selectedMember);
                    }}>
                      Assign Task
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => {
                      setIsProfileOpen(false);
                      handleViewSchedule(selectedMember);
                    }}>
                      View Schedule
                    </Button>
                  </div>
                </div>
              </div>

              <DialogFooter>
                <Button onClick={() => setIsProfileOpen(false)} data-testid="close-profile">
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

export default Team;
