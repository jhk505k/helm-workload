import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, ListChecks, CalendarRange, Users, BarChart3, Settings, ChevronLeft, ChevronRight } from 'lucide-react';
import { motion } from 'framer-motion';

const navItems = [
  { label: 'Overview', icon: LayoutDashboard, path: '/' },
  { label: 'Tasks', icon: ListChecks, path: '/tasks' },
  { label: 'Schedule', icon: CalendarRange, path: '/schedule' },
  { label: 'Team', icon: Users, path: '/team' },
  { label: 'Reports', icon: BarChart3, path: '/reports' },
  { label: 'Settings', icon: Settings, path: '/settings' },
];

const Sidebar = ({ collapsed, onToggle }) => {
  return (
    <motion.aside
      initial={{ width: collapsed ? 80 : 288 }}
      animate={{ width: collapsed ? 80 : 288 }}
      transition={{ duration: 0.22, ease: [0.2, 0.0, 0, 1] }}
      className="bg-card border-r border-border flex flex-col h-full"
      data-testid="sidebar"
    >
      <div className="p-6 border-b border-border flex items-center justify-between">
        {!collapsed && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="flex items-center gap-2"
          >
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-lg">H</span>
            </div>
            <div>
              <h1 className="text-base font-semibold tracking-tight">Helm HR Ops</h1>
              <p className="text-xs text-muted-foreground">Direct. Assign. Adapt.</p>
            </div>
          </motion.div>
        )}
        {collapsed && (
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center mx-auto">
            <span className="text-primary-foreground font-bold text-lg">H</span>
          </div>
        )}
      </div>

      <nav className="flex-1 p-3 space-y-1" data-testid="sidebar-nav">
        {navItems.map((item, idx) => (
          <NavLink
            key={item.path}
            to={item.path}
            end={item.path === '/'}
            className={({ isActive }) =>
              `flex items-center gap-3 h-10 px-3 rounded-md text-sm font-medium transition-all duration-200 ${isActive
                ? 'bg-accent text-foreground shadow-sm'
                : 'text-foreground/80 hover:text-foreground hover:bg-accent/50'
              }`
            }
            data-testid={`nav-${item.label.toLowerCase()}`}
          >
            <item.icon className="w-5 h-5 flex-shrink-0" />
            {!collapsed && (
              <motion.span
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.02, duration: 0.22 }}
              >
                {item.label}
              </motion.span>
            )}
          </NavLink>
        ))}
      </nav>

      <div className="p-3 border-t border-border">
        <button
          onClick={onToggle}
          className="w-full flex items-center justify-center gap-2 h-10 px-3 rounded-md text-sm font-medium text-foreground/80 hover:text-foreground hover:bg-accent transition-colors"
          data-testid="sidebar-toggle"
        >
          {collapsed ? <ChevronRight className="w-5 h-5" /> : <ChevronLeft className="w-5 h-5" />}
          {!collapsed && <span>Collapse</span>}
        </button>
      </div>
    </motion.aside>
  );
};

export default Sidebar;
