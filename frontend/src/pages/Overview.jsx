import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ListChecks, CheckCircle2, Activity, AlertTriangle, Sparkles, TrendingUp, Clock } from 'lucide-react';
import { motion } from 'framer-motion';
import { Card } from '../components/ui/card';
import { Button } from '../components/ui/button';
import KPICard from '../components/KPICard';
import AIRecommendation from '../components/AIRecommendation';
import KanbanBoard from '../components/KanbanBoard';
import WeekCalendar from '../components/WeekCalendar';
import TeamCapacity from '../components/TeamCapacity';
import ActivityFeed from '../components/ActivityFeed';

const Overview = () => {
  const navigate = useNavigate();
  
  const [kpiData, setKpiData] = useState(() => {
    const saved = localStorage.getItem('kpiData');
    return saved ? JSON.parse(saved) : {
      openTasks: { value: 128, delta: '+12%' },
      fillRate: { value: '92%', delta: '+3%' },
      utilization: { value: '76%', delta: '-2%' },
      conflicts: { value: 9, delta: '+4' },
    };
  });

  const [recommendations, setRecommendations] = useState(() => {
    const saved = localStorage.getItem('aiRecommendations');
    const parsedData = saved ? JSON.parse(saved) : null;
    
    // Check if saved data has the new 'details' structure
    const hasDetailsStructure = parsedData && parsedData[0] && parsedData[0].details;
    
    // If old structure, clear and use new default data
    if (!hasDetailsStructure) {
      localStorage.removeItem('aiRecommendations');
    }
    
    return (hasDetailsStructure ? parsedData : [
      {
        id: 1,
        title: 'Assign Avery Chen to Client Onboarding (Tue 10–2)',
        reason: 'Skill match: onboarding + available window; avoids overtime',
        confidence: 0.82,
        badge: 'Schedule',
        type: 'schedule',
        details: {
          currentState: {
            assignee: 'Unassigned',
            timeSlot: 'Not scheduled',
            workload: 'N/A',
            utilizationRate: 0
          },
          proposedState: {
            assignee: 'Avery Chen',
            timeSlot: 'Tuesday 10:00 - 14:00',
            workload: '4 hours',
            utilizationRate: 82
          },
          impact: {
            utilizationChange: '+82%',
            overtimeReduction: '2h saved',
            skillMatch: '95%',
            availabilityFit: '100%'
          },
          reasoning: [
            'Avery has "Client Onboarding" certification and 2 years experience',
            'Tuesday 10-2 slot is completely free in her calendar',
            'This assignment keeps her weekly hours at 38h (below 40h overtime threshold)',
            'Alternative assignees would require 1.5x longer due to skill gap'
          ],
          metrics: {
            beforeUtilization: 68,
            afterUtilization: 82,
            teamCapacityBefore: 76,
            teamCapacityAfter: 81
          }
        }
      },
      {
        id: 2,
        title: 'Move "Q4 Budget Review" to Sarah Mitchell',
        reason: 'Sarah has finance background and 6 hours free this week',
        confidence: 0.76,
        badge: 'Assignment',
        type: 'assignment',
        details: {
          currentState: {
            assignee: 'John Doe',
            timeSlot: 'Wednesday 14:00',
            workload: '42 hours this week',
            utilizationRate: 105
          },
          proposedState: {
            assignee: 'Sarah Mitchell',
            timeSlot: 'Wednesday 14:00',
            workload: '38 hours this week',
            utilizationRate: 95
          },
          impact: {
            utilizationChange: 'Balanced workload',
            overtimeReduction: '2h saved for John',
            skillMatch: '88%',
            availabilityFit: '100%'
          },
          reasoning: [
            'John Doe is currently at 105% utilization (42h/week)',
            'Sarah Mitchell has Finance degree and 6h available capacity',
            'Task requires financial analysis skills - Sarah is qualified',
            'Redistributing reduces overtime costs by $120/week'
          ],
          metrics: {
            beforeUtilization: 105,
            afterUtilization: 95,
            teamCapacityBefore: 76,
            teamCapacityAfter: 78
          }
        }
      },
      {
        id: 3,
        title: 'Split "System Migration" between Dev Team',
        reason: '3 team members with relevant skills available Thu-Fri',
        confidence: 0.88,
        badge: 'Distribution',
        type: 'distribution',
        details: {
          currentState: {
            assignee: 'John Kim (solo)',
            timeSlot: 'Friday 11:00',
            workload: '12 hours estimated',
            utilizationRate: 98
          },
          proposedState: {
            assignee: 'John Kim, Lisa Martinez, Paul Quinn',
            timeSlot: 'Thursday-Friday distributed',
            workload: '4 hours each',
            utilizationRate: 85
          },
          impact: {
            utilizationChange: 'Balanced across 3 people',
            completionTime: '2 days faster',
            skillMatch: '92%',
            riskReduction: 'Single point of failure eliminated'
          },
          reasoning: [
            'Task complexity score: 8.5/10 - too high for single person',
            'John Kim, Lisa Martinez, Paul Quinn all have DevOps certification',
            'Parallel work possible: Database, API, Frontend can be done simultaneously',
            'Risk mitigation: Knowledge spread across team reduces project risk'
          ],
          metrics: {
            beforeUtilization: 98,
            afterUtilization: 85,
            teamCapacityBefore: 76,
            teamCapacityAfter: 81
          }
        }
      },
    ]);
  });

  useEffect(() => {
    localStorage.setItem('kpiData', JSON.stringify(kpiData));
  }, [kpiData]);

  useEffect(() => {
    localStorage.setItem('aiRecommendations', JSON.stringify(recommendations));
  }, [recommendations]);

  const handleApplyRecommendation = (id) => {
    setRecommendations(prev => prev.filter(rec => rec.id !== id));
  };

  const handleDismissRecommendation = (id) => {
    setRecommendations(prev => prev.filter(rec => rec.id !== id));
  };

  const handleApplyAll = () => {
    setRecommendations([]);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.22 }}
      className="space-y-4 sm:space-y-6"
      data-testid="overview-page"
    >
      <div>
        <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight">Overview</h1>
        <p className="text-sm sm:text-base text-muted-foreground mt-1">Monitor performance and act on AI recommendations</p>
      </div>

      {/* KPI Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6" data-testid="kpi-strip">
        <KPICard
          title="Open Tasks"
          value={kpiData.openTasks.value}
          delta={kpiData.openTasks.delta}
          icon={ListChecks}
          deltaType="positive"
          onClick={() => navigate('/tasks?filter=Open')}
        />
        <KPICard
          title="Fill Rate"
          value={kpiData.fillRate.value}
          delta={kpiData.fillRate.delta}
          icon={CheckCircle2}
          deltaType="info"
          onClick={() => navigate('/tasks?filter=Completed')}
        />
        <KPICard
          title="Utilization"
          value={kpiData.utilization.value}
          delta={kpiData.utilization.delta}
          icon={Activity}
          deltaType="warning"
          onClick={() => navigate('/tasks?filter=In Progress')}
        />
        <KPICard
          title="Conflicts"
          value={kpiData.conflicts.value}
          delta={kpiData.conflicts.delta}
          icon={AlertTriangle}
          deltaType="danger"
          onClick={() => navigate('/schedule')}
        />
      </div>

      {/* AI Recommendations */}
      {recommendations.length > 0 && (
        <Card className="p-6 shadow-sm" data-testid="ai-recommendations">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h2 className="text-base font-semibold flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-primary" />
                AI Recommendations
              </h2>
              <p className="text-sm text-muted-foreground mt-1">
                Suggested assignments and schedule optimizations based on availability, skills, and constraints.
              </p>
            </div>
            <div className="flex gap-2">
              <Button onClick={handleApplyAll} size="sm" data-testid="apply-all-button">
                <Sparkles className="w-4 h-4 mr-2" />
                Apply All
              </Button>
            </div>
          </div>

          <div className="space-y-3">
            {recommendations.map((rec, idx) => (
              <motion.div
                key={rec.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.04, duration: 0.22 }}
              >
                <AIRecommendation
                  recommendation={rec}
                  onApply={() => handleApplyRecommendation(rec.id)}
                  onDismiss={() => handleDismissRecommendation(rec.id)}
                />
              </motion.div>
            ))}
          </div>
        </Card>
      )}

      {/* Task Board & Calendar */}
      <div className="grid grid-cols-12 gap-6" data-testid="task-calendar-section">
        <div className="col-span-12 lg:col-span-7">
          <KanbanBoard />
        </div>
        <div className="col-span-12 lg:col-span-5">
          <WeekCalendar />
        </div>
      </div>

      {/* Capacity & Activity */}
      <div className="grid grid-cols-12 gap-6" data-testid="capacity-activity-section">
        <div className="col-span-12 lg:col-span-7">
          <TeamCapacity />
        </div>
        <div className="col-span-12 lg:col-span-5">
          <ActivityFeed />
        </div>
      </div>
    </motion.div>
  );
};

export default Overview;
