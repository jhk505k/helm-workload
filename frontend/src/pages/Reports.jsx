import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { BarChart3, TrendingUp, Download, Calendar } from 'lucide-react';
import { Card } from '../components/ui/card';
import { Button } from '../components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../components/ui/select';

const Reports = () => {
  const [timeRange, setTimeRange] = useState('week');

  const reportCards = [
    {
      id: 1,
      title: 'Task Completion Rate',
      value: '87%',
      change: '+5% from last period',
      trend: 'up',
    },
    {
      id: 2,
      title: 'Team Utilization',
      value: '76%',
      change: '-2% from last period',
      trend: 'down',
    },
    {
      id: 3,
      title: 'Average Task Duration',
      value: '3.2 days',
      change: '-0.4 days from last period',
      trend: 'up',
    },
    {
      id: 4,
      title: 'On-Time Delivery',
      value: '92%',
      change: '+3% from last period',
      trend: 'up',
    },
  ];

  const recentReports = [
    { id: 1, name: 'Q4 2024 Performance Report', date: 'Jan 10, 2025', type: 'Performance' },
    { id: 2, name: 'December Utilization Analysis', date: 'Jan 5, 2025', type: 'Utilization' },
    { id: 3, name: 'Team Capacity Overview', date: 'Dec 28, 2024', type: 'Capacity' },
    { id: 4, name: 'Task Distribution Report', date: 'Dec 20, 2024', type: 'Distribution' },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.22 }}
      className="space-y-6"
      data-testid="reports-page"
    >
      <div>
        <h1 className="text-3xl font-semibold tracking-tight">Reports</h1>
        <p className="text-muted-foreground mt-1">Analytics and performance insights</p>
      </div>

      <Card className="p-6 shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Calendar className="w-5 h-5 text-muted-foreground" />
            <Select value={timeRange} onValueChange={setTimeRange}>
              <SelectTrigger className="w-[180px] bg-background" data-testid="time-range-select">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-background">
                <SelectItem value="week">This Week</SelectItem>
                <SelectItem value="month">This Month</SelectItem>
                <SelectItem value="quarter">This Quarter</SelectItem>
                <SelectItem value="year">This Year</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Button variant="outline" data-testid="export-button">
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {reportCards.map((card, idx) => (
            <motion.div
              key={card.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.04, duration: 0.22 }}
              whileHover={{ y: -2 }}
              data-testid={`report-card-${card.id}`}
            >
              <Card className="p-5 shadow-sm hover:shadow-md transition-all">
                <div className="flex items-start justify-between mb-3">
                  <BarChart3 className="w-5 h-5 text-primary" />
                  <TrendingUp className={`w-4 h-4 ${card.trend === 'up' ? 'text-status-success' : 'text-status-danger'}`} />
                </div>
                <p className="text-sm text-muted-foreground mb-2">{card.title}</p>
                <p className="text-2xl font-semibold tracking-tight mb-2">{card.value}</p>
                <p className={`text-xs ${card.trend === 'up' ? 'text-status-success' : 'text-status-danger'}`}>
                  {card.change}
                </p>
              </Card>
            </motion.div>
          ))}
        </div>

        <div className="border-t border-border pt-6">
          <h3 className="text-base font-semibold mb-4">Recent Reports</h3>
          <div className="space-y-2">
            {recentReports.map((report, idx) => (
              <motion.div
                key={report.id}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.04, duration: 0.22 }}
                className="flex items-center justify-between p-4 rounded-lg border border-border hover:bg-accent/50 transition-colors"
                data-testid={`recent-report-${report.id}`}
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-accent">
                    <BarChart3 className="w-4 h-4 text-foreground/70" />
                  </div>
                  <div>
                    <h4 className="text-sm font-medium">{report.name}</h4>
                    <p className="text-xs text-muted-foreground mt-0.5">{report.type} • {report.date}</p>
                  </div>
                </div>
                <Button variant="ghost" size="sm" data-testid={`download-report-${report.id}`}>
                  <Download className="w-4 h-4" />
                </Button>
              </motion.div>
            ))}
          </div>
        </div>
      </Card>
    </motion.div>
  );
};

export default Reports;
