import React, { useState, useEffect } from 'react';
import { TrendingUp, X, ChevronDown, ChevronUp, ArrowRight, Check, AlertCircle, CheckCircle2, Sparkles } from 'lucide-react';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Card } from './ui/card';
import { motion, AnimatePresence } from 'framer-motion';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from './ui/alert-dialog';

const AIRecommendation = ({ recommendation, onApply, onDismiss }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [showApplyDialog, setShowApplyDialog] = useState(false);
  const [showDismissDialog, setShowDismissDialog] = useState(false);
  const confidencePercent = Math.round(recommendation.confidence * 100);
  const details = recommendation.details || {};
  const hasDetails = details && details.currentState && details.proposedState;
  
  // Debug logging
  useEffect(() => {
    console.log('Recommendation:', recommendation.id, 'Has Details:', hasDetails, 'Details:', details);
  }, [recommendation.id, hasDetails, details]);

  const handleApplyClick = () => {
    setShowApplyDialog(true);
  };

  const handleConfirmApply = () => {
    setShowApplyDialog(false);
    onApply();
  };

  const handleDismissClick = () => {
    setShowDismissDialog(true);
  };

  const handleConfirmDismiss = () => {
    setShowDismissDialog(false);
    onDismiss();
  };

  const UtilizationBar = ({ before, after, label }) => (
    <div className="space-y-1">
      <div className="flex items-center justify-between text-xs">
        <span className="text-muted-foreground">{label}</span>
        <span className="font-medium">{before}% → {after}%</span>
      </div>
      <div className="relative h-2 bg-muted rounded-full overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${before}%` }}
          transition={{ duration: 0.5 }}
          className={`absolute h-full ${before > 100 ? 'bg-status-danger' : before > 85 ? 'bg-status-warning' : 'bg-status-info'}`}
        />
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${after}%` }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className={`absolute h-full ${after > 100 ? 'bg-status-danger' : after > 85 ? 'bg-status-warning' : 'bg-status-success'} opacity-70`}
          style={{ marginTop: '4px' }}
        />
      </div>
      <div className="flex items-center gap-2 text-xs">
        <span className={`w-2 h-2 rounded-full ${before > 100 ? 'bg-status-danger' : before > 85 ? 'bg-status-warning' : 'bg-status-info'}`} />
        <span className="text-muted-foreground">Before</span>
        <span className={`w-2 h-2 rounded-full ${after > 100 ? 'bg-status-danger' : after > 85 ? 'bg-status-warning' : 'bg-status-success'} ml-2`} />
        <span className="text-muted-foreground">After</span>
      </div>
    </div>
  );

  return (
    <div
      className="rounded-md border border-border bg-card hover:shadow-sm transition-all"
      data-testid={`recommendation-${recommendation.id}`}
    >
      {/* Main Recommendation Header */}
      <div className="grid grid-cols-12 gap-3 p-4">
        <div className="col-span-12 md:col-span-8 flex flex-col gap-2">
          <div className="flex items-start gap-2">
            <TrendingUp className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
            <div className="flex-1">
              <h3 className="text-sm font-medium">{recommendation.title}</h3>
              <p className="text-xs text-muted-foreground mt-1">{recommendation.reason}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="text-xs">
              {recommendation.badge}
            </Badge>
            <span className="text-xs text-muted-foreground">
              {confidencePercent}% confidence
            </span>
            {hasDetails && (
              <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="ml-2 text-xs text-primary hover:underline flex items-center gap-1 font-medium"
                data-testid={`expand-recommendation-${recommendation.id}`}
              >
                {isExpanded ? 'Hide details' : 'View AI calculation details'}
                {isExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
              </button>
            )}
            {!hasDetails && (
              <span className="ml-2 text-xs text-muted-foreground italic">
                (Detailed analysis not available)
              </span>
            )}
          </div>
        </div>
        <div className="col-span-12 md:col-span-4 flex items-center justify-end gap-2">
          <Button
            size="sm"
            onClick={handleApplyClick}
            data-testid={`apply-recommendation-${recommendation.id}`}
          >
            Apply
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={handleDismissClick}
            data-testid={`dismiss-recommendation-${recommendation.id}`}
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Expanded Details */}
      <AnimatePresence>
        {isExpanded && hasDetails && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <div className="border-t border-border p-4 bg-accent/20 space-y-4">
              {/* Before & After Comparison */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Current State */}
                <Card className="p-4 bg-background border-border">
                  <div className="flex items-center gap-2 mb-3">
                    <AlertCircle className="w-4 h-4 text-muted-foreground" />
                    <h4 className="text-sm font-semibold">Current State</h4>
                  </div>
                  <div className="space-y-2 text-xs">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Assignee:</span>
                      <span className="font-medium">{details.currentState.assignee}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Time Slot:</span>
                      <span className="font-medium">{details.currentState.timeSlot}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Workload:</span>
                      <span className="font-medium">{details.currentState.workload}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Utilization:</span>
                      <span className={`font-medium ${details.currentState.utilizationRate > 100 ? 'text-status-danger' : details.currentState.utilizationRate > 85 ? 'text-status-warning' : 'text-foreground'}`}>
                        {details.currentState.utilizationRate}%
                      </span>
                    </div>
                  </div>
                </Card>

                {/* Proposed State */}
                <Card className="p-4 bg-primary/5 border-primary/20">
                  <div className="flex items-center gap-2 mb-3">
                    <Check className="w-4 h-4 text-primary" />
                    <h4 className="text-sm font-semibold text-primary">Proposed State</h4>
                  </div>
                  <div className="space-y-2 text-xs">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Assignee:</span>
                      <span className="font-medium">{details.proposedState.assignee}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Time Slot:</span>
                      <span className="font-medium">{details.proposedState.timeSlot}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Workload:</span>
                      <span className="font-medium">{details.proposedState.workload}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Utilization:</span>
                      <span className={`font-medium ${details.proposedState.utilizationRate > 100 ? 'text-status-danger' : details.proposedState.utilizationRate > 85 ? 'text-status-warning' : 'text-status-success'}`}>
                        {details.proposedState.utilizationRate}%
                      </span>
                    </div>
                  </div>
                </Card>
              </div>

              {/* Impact Metrics */}
              {details.impact && (
                <Card className="p-4 bg-background">
                  <h4 className="text-sm font-semibold mb-3 flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-status-success" />
                    Expected Impact
                  </h4>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {Object.entries(details.impact).map(([key, value]) => (
                      <div key={key} className="text-center">
                        <div className="text-xs text-muted-foreground mb-1">
                          {key.replace(/([A-Z])/g, ' $1').trim()}
                        </div>
                        <div className="text-sm font-semibold text-primary">{value}</div>
                      </div>
                    ))}
                  </div>
                </Card>
              )}

              {/* Utilization Visualization */}
              {details.metrics && (
                <Card className="p-4 bg-background">
                  <h4 className="text-sm font-semibold mb-4">Utilization Analysis</h4>
                  <div className="space-y-4">
                    <UtilizationBar
                      before={details.metrics.beforeUtilization}
                      after={details.metrics.afterUtilization}
                      label="Individual Utilization"
                    />
                    <UtilizationBar
                      before={details.metrics.teamCapacityBefore}
                      after={details.metrics.teamCapacityAfter}
                      label="Team Capacity"
                    />
                  </div>
                </Card>
              )}

              {/* Reasoning */}
              {details.reasoning && details.reasoning.length > 0 && (
                <Card className="p-4 bg-background">
                  <h4 className="text-sm font-semibold mb-3">AI Reasoning</h4>
                  <ul className="space-y-2">
                    {details.reasoning.map((reason, idx) => (
                      <motion.li
                        key={idx}
                        initial={{ opacity: 0, x: -8 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: idx * 0.1 }}
                        className="flex items-start gap-2 text-xs"
                        data-testid={`reasoning-${recommendation.id}-${idx}`}
                      >
                        <ArrowRight className="w-3 h-3 text-primary mt-0.5 flex-shrink-0" />
                        <span className="text-muted-foreground">{reason}</span>
                      </motion.li>
                    ))}
                  </ul>
                </Card>
              )}

              {/* Action Buttons in Expanded View */}
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="flex items-center justify-end gap-3 pt-2"
              >
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleDismissClick}
                  data-testid={`dismiss-recommendation-expanded-${recommendation.id}`}
                >
                  <X className="w-4 h-4 mr-2" />
                  Dismiss This Recommendation
                </Button>
                <Button
                  size="sm"
                  onClick={handleApplyClick}
                  className="bg-primary hover:bg-primary/90"
                  data-testid={`apply-recommendation-expanded-${recommendation.id}`}
                >
                  <Sparkles className="w-4 h-4 mr-2" />
                  Apply This Recommendation
                </Button>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Apply Confirmation Dialog */}
      <AlertDialog open={showApplyDialog} onOpenChange={setShowApplyDialog}>
        <AlertDialogContent data-testid={`apply-dialog-${recommendation.id}`}>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-primary" />
              Apply AI Recommendation?
            </AlertDialogTitle>
            <AlertDialogDescription className="space-y-3 pt-2">
              <p className="text-sm">
                You're about to apply the following recommendation:
              </p>
              <div className="bg-accent/50 p-3 rounded-md space-y-2">
                <p className="text-sm font-medium text-foreground">{recommendation.title}</p>
                <p className="text-xs text-muted-foreground">{recommendation.reason}</p>
              </div>
              {hasDetails && (
                <div className="space-y-2 text-xs">
                  <div className="grid grid-cols-2 gap-2">
                    <div className="bg-muted/50 p-2 rounded">
                      <span className="text-muted-foreground block mb-1">Current:</span>
                      <span className="font-medium">{details.currentState.assignee}</span>
                    </div>
                    <div className="bg-primary/10 p-2 rounded border border-primary/20">
                      <span className="text-muted-foreground block mb-1">Will Change To:</span>
                      <span className="font-medium text-primary">{details.proposedState.assignee}</span>
                    </div>
                  </div>
                  {details.impact && (
                    <div className="bg-status-success/10 p-2 rounded border border-status-success/20">
                      <span className="text-muted-foreground block mb-1">Expected Impact:</span>
                      <span className="font-medium text-status-success">{details.impact.overtimeReduction || 'Workload optimized'}</span>
                    </div>
                  )}
                </div>
              )}
              <p className="text-xs text-muted-foreground italic">
                This action will update the schedule and notify affected team members.
              </p>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel data-testid={`cancel-apply-${recommendation.id}`}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmApply}
              className="bg-primary hover:bg-primary/90"
              data-testid={`confirm-apply-${recommendation.id}`}
            >
              Yes, Apply Recommendation
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Dismiss Confirmation Dialog */}
      <AlertDialog open={showDismissDialog} onOpenChange={setShowDismissDialog}>
        <AlertDialogContent data-testid={`dismiss-dialog-${recommendation.id}`}>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <X className="w-5 h-5 text-muted-foreground" />
              Dismiss This Recommendation?
            </AlertDialogTitle>
            <AlertDialogDescription className="space-y-3 pt-2">
              <p className="text-sm">
                Are you sure you want to dismiss this recommendation?
              </p>
              <div className="bg-accent/50 p-3 rounded-md">
                <p className="text-sm font-medium text-foreground">{recommendation.title}</p>
              </div>
              <p className="text-xs text-muted-foreground italic">
                You can always find similar recommendations in the future if needed.
              </p>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel data-testid={`cancel-dismiss-${recommendation.id}`}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDismiss}
              className="bg-muted hover:bg-muted/90"
              data-testid={`confirm-dismiss-${recommendation.id}`}
            >
              Yes, Dismiss
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default AIRecommendation;
